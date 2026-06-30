"""
Videos crawler — YouTube Data API v3.

Populates:
  • videos (title, description, youtube_url, thumbnail, category,
            duration_seconds, is_published, published_at)

Category is inferred from the video title / description keywords.
"""

import asyncio
import logging
import re
from datetime import datetime

import httpx

from config import Config
from supabase_client import SupabaseClient
from utils import retry, truncate

logger = logging.getLogger(__name__)

YT_API = "https://www.googleapis.com/youtube/v3"
CHANNEL_ID = Config.ARTIST_YOUTUBE_CHANNEL_ID
MAX_RESULTS = 200   # total videos to fetch (paginated)


# ── Category inference ────────────────────────────────────────────────────────

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "music_video": ["official video", "music video", "official mv", "official music"],
    "lyric_video": ["lyric video", "lyrics", "official lyric"],
    "live": ["live", "concert", "performance", "at the", "unplugged", "acoustic", "stadium", "arena"],
    "interview": ["interview", "talks", "sits down", "exclusive", "chat", "q&a"],
    "behind_scenes": ["behind the scenes", "bts", "making of", "studio session", "day in the life", "vlog", "tour diary"],
}

def _infer_category(title: str, description: str = "") -> str:
    combined = (title + " " + description).lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return category
    return "music_video"   # default


# ── Duration parsing ──────────────────────────────────────────────────────────

def _iso_duration_to_seconds(duration: str | None) -> int | None:
    """Parse ISO 8601 duration string (e.g. PT3M45S) to seconds."""
    if not duration:
        return None
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return None
    h, m, s = (int(x or 0) for x in match.groups())
    return h * 3600 + m * 60 + s


# ── Fetch ─────────────────────────────────────────────────────────────────────

@retry(max_attempts=3)
async def _search_videos(client: httpx.AsyncClient, page_token: str | None = None) -> dict:
    params = {
        "part": "snippet",
        "channelId": CHANNEL_ID,
        "type": "video",
        "order": "date",
        "maxResults": 50,
        "key": Config.YOUTUBE_API_KEY,
    }
    if page_token:
        params["pageToken"] = page_token
    resp = await client.get(f"{YT_API}/search", params=params, timeout=Config.REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.json()


@retry(max_attempts=3)
async def _get_video_details(client: httpx.AsyncClient, video_ids: list[str]) -> list[dict]:
    resp = await client.get(
        f"{YT_API}/videos",
        params={
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids),
            "key": Config.YOUTUBE_API_KEY,
        },
        timeout=Config.REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json().get("items", [])


# ── Transform ─────────────────────────────────────────────────────────────────

def _video_record(item: dict) -> dict:
    snippet = item.get("snippet", {})
    content = item.get("contentDetails", {})
    video_id = item["id"]
    title = snippet.get("title", "")
    description = snippet.get("description", "")
    thumbnails = snippet.get("thumbnails", {})
    thumbnail = (
        thumbnails.get("maxres", {}).get("url")
        or thumbnails.get("high", {}).get("url")
        or thumbnails.get("default", {}).get("url")
    )
    published_raw = snippet.get("publishedAt", "")
    published_at = published_raw[:10] if published_raw else None

    return {
        "title": title,
        "description": truncate(description, 500),
        "youtube_url": f"https://www.youtube.com/watch?v={video_id}",
        "thumbnail": thumbnail,
        "imagekit_path": None,   # not uploading video thumbs to IK
        "category": _infer_category(title, description),
        "duration_seconds": _iso_duration_to_seconds(content.get("duration")),
        "is_published": True,
        "published_at": published_at or "2020-01-01",
    }


# ── Main ──────────────────────────────────────────────────────────────────────

async def run() -> dict:
    db = SupabaseClient()
    stats = {"videos": 0, "errors": []}

    if not Config.YOUTUBE_API_KEY:
        logger.error("YOUTUBE_API_KEY not set — skipping videos crawler")
        return stats

    all_video_ids: list[str] = []
    page_token = None
    fetched = 0

    async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
        # Collect all video IDs from channel
        while fetched < MAX_RESULTS:
            logger.info("Fetching YouTube search page (offset %d)…", fetched)
            try:
                data = await _search_videos(client, page_token)
            except Exception as exc:
                logger.error("YouTube search failed: %s", exc)
                stats["errors"].append(str(exc))
                break

            items = data.get("items", [])
            all_video_ids.extend(item["id"]["videoId"] for item in items if item.get("id", {}).get("videoId"))
            fetched += len(items)
            page_token = data.get("nextPageToken")
            if not page_token:
                break
            await asyncio.sleep(0.5)

        logger.info("Found %d video IDs — fetching details…", len(all_video_ids))

        # Fetch details in batches of 50
        all_records: list[dict] = []
        for i in range(0, len(all_video_ids), 50):
            batch_ids = all_video_ids[i:i+50]
            try:
                details = await _get_video_details(client, batch_ids)
                all_records.extend(_video_record(v) for v in details)
            except Exception as exc:
                logger.error("Video details fetch failed: %s", exc)
                stats["errors"].append(str(exc))
            await asyncio.sleep(0.3)

    if all_records:
        upserted = await db.upsert("videos", all_records, on_conflict="youtube_url")
        stats["videos"] = len(upserted)

    logger.info("Videos done: %d videos upserted", stats["videos"])
    return stats


if __name__ == "__main__":
    import utils; utils.setup_logging()
    asyncio.run(run())
