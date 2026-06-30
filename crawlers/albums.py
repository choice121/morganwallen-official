"""
Albums & Tracks crawler — Spotify Web API.

Populates:
  • albums  (title, slug, release_date, cover_image, description,
             spotify_url, apple_music_url, is_published)
  • tracks  (album_id, title, track_number, duration_seconds,
             spotify_url, apple_music_url, is_published)
"""

import asyncio
import base64
import logging
from datetime import datetime

import httpx

from config import Config
from supabase_client import SupabaseClient
from utils import slugify, retry

logger = logging.getLogger(__name__)

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API = "https://api.spotify.com/v1"

# Morgan Wallen's verified Spotify artist ID
ARTIST_ID = Config.ARTIST_SPOTIFY_ID


# ── Auth ──────────────────────────────────────────────────────────────────────

async def _get_token(client: httpx.AsyncClient) -> str:
    creds = base64.b64encode(
        f"{Config.SPOTIFY_CLIENT_ID}:{Config.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()
    resp = await client.post(
        SPOTIFY_TOKEN_URL,
        headers={"Authorization": f"Basic {creds}"},
        data={"grant_type": "client_credentials"},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


# ── Fetch ─────────────────────────────────────────────────────────────────────

@retry(max_attempts=3)
async def _get_all_albums(client: httpx.AsyncClient, token: str) -> list[dict]:
    """Fetch all album groups (album, single, compilation) for the artist."""
    albums = []
    for group in ("album", "single"):
        offset = 0
        while True:
            resp = await client.get(
                f"{SPOTIFY_API}/artists/{ARTIST_ID}/albums",
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "include_groups": group,
                    "market": "US",
                    "limit": 50,
                    "offset": offset,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            albums.extend(data["items"])
            if data["next"] is None:
                break
            offset += 50
    return albums


@retry(max_attempts=3)
async def _get_tracks(client: httpx.AsyncClient, token: str, album_id: str) -> list[dict]:
    tracks = []
    offset = 0
    while True:
        resp = await client.get(
            f"{SPOTIFY_API}/albums/{album_id}/tracks",
            headers={"Authorization": f"Bearer {token}"},
            params={"market": "US", "limit": 50, "offset": offset},
        )
        resp.raise_for_status()
        data = resp.json()
        tracks.extend(data["items"])
        if data["next"] is None:
            break
        offset += 50
    return tracks


# ── Transform ─────────────────────────────────────────────────────────────────

def _album_record(sp_album: dict) -> dict:
    title = sp_album["name"]
    images = sp_album.get("images", [])
    cover = images[0]["url"] if images else None
    return {
        "title": title,
        "slug": slugify(title),
        "release_date": sp_album.get("release_date"),
        "cover_image": cover,
        "description": f"{title} — {sp_album.get('album_type', 'release').title()} by Morgan Wallen.",
        "spotify_url": sp_album.get("external_urls", {}).get("spotify"),
        "apple_music_url": None,   # Spotify doesn't return Apple Music URLs
        "youtube_url": None,
        "is_published": True,
    }


def _track_record(sp_track: dict, album_db_id: str) -> dict:
    return {
        "album_id": album_db_id,
        "title": sp_track["name"],
        "track_number": sp_track.get("track_number"),
        "duration_seconds": (sp_track.get("duration_ms") or 0) // 1000 or None,
        "spotify_url": sp_track.get("external_urls", {}).get("spotify"),
        "apple_music_url": None,
        "youtube_url": None,
        "is_published": True,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

async def run() -> dict:
    db = SupabaseClient()
    stats = {"albums": 0, "tracks": 0, "errors": []}

    async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
        logger.info("Authenticating with Spotify…")
        token = await _get_token(client)

        logger.info("Fetching albums for artist %s…", ARTIST_ID)
        sp_albums = await _get_all_albums(client, token)
        logger.info("Found %d Spotify albums/singles", len(sp_albums))

        # Deduplicate by title (Spotify returns explicit + clean versions)
        seen_titles: set[str] = set()
        unique_albums = []
        for a in sp_albums:
            key = a["name"].lower().strip()
            if key not in seen_titles:
                seen_titles.add(key)
                unique_albums.append(a)

        # Upsert albums
        album_rows = [_album_record(a) for a in unique_albums]
        upserted = await db.upsert("albums", album_rows, on_conflict="slug")
        stats["albums"] = len(upserted)

        # Build title→id map from upserted rows
        id_map = {row["slug"]: row["id"] for row in upserted}

        # Upsert tracks for each album
        for sp_album in unique_albums:
            slug = slugify(sp_album["name"])
            album_db_id = id_map.get(slug)
            if not album_db_id:
                logger.warning("Could not find DB id for album '%s'", sp_album["name"])
                continue

            try:
                sp_tracks = await _get_tracks(client, token, sp_album["id"])
                track_rows = [_track_record(t, album_db_id) for t in sp_tracks]
                if track_rows:
                    await db.upsert("tracks", track_rows, on_conflict="album_id,track_number")
                    stats["tracks"] += len(track_rows)
                    logger.info("  ↳ %s — %d tracks", sp_album["name"], len(track_rows))
            except Exception as exc:
                logger.error("Error fetching tracks for %s: %s", sp_album["name"], exc)
                stats["errors"].append(str(exc))

            await asyncio.sleep(0.3)   # be polite to Spotify

    logger.info("Albums done: %d albums, %d tracks", stats["albums"], stats["tracks"])
    return stats


if __name__ == "__main__":
    import utils; utils.setup_logging()
    asyncio.run(run())
