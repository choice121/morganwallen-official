"""
Central configuration — reads from environment variables.
Copy .env.example to .env for local development.
In GitHub Actions, set all variables as repository secrets.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://yxspomuwawzsnsjpqxid.supabase.co")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # ── Spotify ───────────────────────────────────────────────────────────────
    SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID", "")
    SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET", "")

    # ── YouTube ───────────────────────────────────────────────────────────────
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")

    # ── ImageKit ──────────────────────────────────────────────────────────────
    IMAGEKIT_PRIVATE_KEY: str = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
    IMAGEKIT_PUBLIC_KEY: str = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
    IMAGEKIT_URL_ENDPOINT: str = "https://ik.imagekit.io/Morganwallen"

    # ── Artist constants ──────────────────────────────────────────────────────
    ARTIST_NAME: str = "Morgan Wallen"
    ARTIST_SPOTIFY_ID: str = "4oUHIQIBe0LHzYfvXgpM2U"   # verified Spotify ID
    ARTIST_YOUTUBE_CHANNEL_ID: str = "UCqFKhz5LzXTVCDVSMZ4N6Yw"  # official channel

    # ── Crawl settings ────────────────────────────────────────────────────────
    REQUEST_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    CRAWL_DELAY: float = 1.0   # seconds between requests

    @classmethod
    def validate(cls) -> list[str]:
        """Return list of missing required env vars."""
        missing = []
        required = {
            "SUPABASE_SERVICE_KEY": cls.SUPABASE_SERVICE_KEY,
            "SPOTIFY_CLIENT_ID": cls.SPOTIFY_CLIENT_ID,
            "SPOTIFY_CLIENT_SECRET": cls.SPOTIFY_CLIENT_SECRET,
            "YOUTUBE_API_KEY": cls.YOUTUBE_API_KEY,
        }
        for name, value in required.items():
            if not value:
                missing.append(name)
        return missing
