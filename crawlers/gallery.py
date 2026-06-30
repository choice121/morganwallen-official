"""
Gallery crawler — YouTube video thumbnails + official press pages.

Strategy:
  1. Use YouTube API (if available) to get high-res thumbnails from all videos
     and store them as gallery/live photos (no ImageKit upload needed if
     IMAGEKIT_PRIVATE_KEY is not set — thumbnail URLs stored directly)
  2. Crawl any official press/media pages for additional photos
  3. Upload images to ImageKit and store paths in gallery_photos

Populates:
  • gallery_photos (title, imagekit_path, category, is_published, sort_order)
"""

import asyncio
import logging

import httpx

from config import Config
from supabase_client import SupabaseClient
from imagekit_client import upload_image
from utils import slugify

logger = logging.getLogger(__name__)

YT_API = "https://www.googleapis.com/youtube/v3"

PHOTO_CATEGORIES = ["live", "studio", "backstage", "press", "fans"]


# ── YouTube thumbnails as gallery "live" photos ───────────────────────────────

async def _fetch_yt_thumbnails(client: httpx.AsyncClient) -> list[dict]:
    """Get high-res thumbnails from all channel videos."""
    thumbnails = []
    page_token = None
    fetched = 0
    max_fetch = 100   # up to 100 video thumbnails for gallery

    while fetched < max_fetch:
        params = {
            "part": "snippet",
            "channelId": Config.ARTIST_YOUTUBE_CHANNEL_ID,
            "type": "video",
            "order": "date",
            "maxResults": 50,
            "key": Config.YOUTUBE_API_KEY,
        }
        if page_token:
            params["pageToken"] = page_token

        resp = await client.get(f"{YT_API}/search", params=params, timeout=Config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            title = snippet.get("title", "").strip()
            thumbs = snippet.get("thumbnails", {})
            # Prefer maxres > high > medium
            thumb_url = (
                thumbs.get("maxres", {}).get("url")
                or thumbs.get("high", {}).get("url")
                or thumbs.get("medium", {}).get("url")
            )
            if thumb_url and title:
                thumbnails.append({"title": title, "url": thumb_url})

        fetched += len(data.get("items", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
        await asyncio.sleep(0.3)

    return thumbnails


async def _upload_or_store(
    source_url: str,
    file_name: str,
    folder: str,
) -> str | None:
    """
    If ImageKit key is available, upload and return the IK path.
    Otherwise return the source URL directly (stored in imagekit_path field).
    """
    if Config.IMAGEKIT_PRIVATE_KEY:
        return await upload_image(source_url, file_name, folder)
    else:
        # Store external URL directly — frontend should handle both formats
        logger.debug("No ImageKit key — storing external URL directly")
        return source_url


async def run() -> dict:
    db = SupabaseClient()
    stats = {"gallery_photos": 0, "errors": []}

    records: list[dict] = []

    # ── 1. YouTube thumbnails (live category) ─────────────────────────────────
    if Config.YOUTUBE_API_KEY:
        async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
            logger.info("Fetching YouTube thumbnails for gallery…")
            try:
                thumbnails = await _fetch_yt_thumbnails(client)
                logger.info("Found %d thumbnails", len(thumbnails))

                for idx, thumb in enumerate(thumbnails[:60]):
                    file_name = f"gallery-live-{idx+1:03d}.jpg"
                    path = await _upload_or_store(thumb["url"], file_name, "/gallery/live")
                    if path:
                        # Infer category: performance/concert titles → live, else press
                        title_lower = thumb["title"].lower()
                        cat = "live"
                        if any(k in title_lower for k in ["behind", "studio", "session", "vlog", "day in"]):
                            cat = "backstage"

                        records.append({
                            "title": thumb["title"][:200],
                            "imagekit_path": path,
                            "category": cat,
                            "taken_at": None,
                            "is_published": True,
                            "sort_order": idx + 1,
                        })
                    await asyncio.sleep(0.1)

            except Exception as exc:
                logger.error("YouTube thumbnails failed: %s", exc)
                stats["errors"].append(str(exc))
    else:
        logger.warning("YOUTUBE_API_KEY not set — skipping YouTube gallery thumbnails")

    # ── 2. Press category placeholder photos (official press kit images) ───────
    # If there are no ImageKit-uploaded photos yet, add well-known press image URLs
    # so the gallery page is not empty on first run.
    PRESS_PHOTOS = [
        {
            "title": "Morgan Wallen — Press Photo",
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Morgan_Wallen_2019.jpg/800px-Morgan_Wallen_2019.jpg",
            "category": "press",
        },
    ]

    if not records:
        for idx, photo in enumerate(PRESS_PHOTOS):
            file_name = f"gallery-press-{idx+1:03d}.jpg"
            path = await _upload_or_store(photo["url"], file_name, "/gallery/press")
            if path:
                records.append({
                    "title": photo["title"],
                    "imagekit_path": path,
                    "category": photo["category"],
                    "taken_at": None,
                    "is_published": True,
                    "sort_order": 1000 + idx,
                })

    if records:
        upserted = await db.upsert("gallery_photos", records, on_conflict="imagekit_path")
        stats["gallery_photos"] = len(upserted)

    logger.info("Gallery done: %d photos upserted", stats["gallery_photos"])
    return stats


if __name__ == "__main__":
    import utils; utils.setup_logging()
    asyncio.run(run())
