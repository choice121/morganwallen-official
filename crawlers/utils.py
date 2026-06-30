"""Shared utilities: slugify, date normalization, retry logic, logging setup."""

import re
import logging
import asyncio
import functools
from datetime import datetime, timezone
from typing import Any, Callable


def setup_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def slugify(text: str, max_length: int = 120) -> str:
    """Convert text to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-{2,}", "-", text)
    return text[:max_length].strip("-")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_date(raw: str | None) -> str | None:
    """Try to parse a date string into ISO 8601 date (YYYY-MM-DD)."""
    if not raw:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%B %d, %Y", "%b %d, %Y", "%d %B %Y"):
        try:
            return datetime.strptime(raw[:len(fmt)+4], fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    # Last resort: grab first 10 chars if they look like YYYY-MM-DD
    if re.match(r"\d{4}-\d{2}-\d{2}", raw):
        return raw[:10]
    return None


def ms_to_seconds(ms: int | None) -> int | None:
    if ms is None:
        return None
    return ms // 1000


def truncate(text: str, length: int = 300) -> str:
    if len(text) <= length:
        return text
    return text[:length].rsplit(" ", 1)[0] + "…"


def retry(max_attempts: int = 3, delay: float = 2.0):
    """Async retry decorator with exponential backoff."""
    def decorator(fn: Callable):
        @functools.wraps(fn)
        async def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return await fn(*args, **kwargs)
                except Exception as exc:
                    if attempt == max_attempts:
                        raise
                    wait = delay * (2 ** (attempt - 1))
                    logging.getLogger(__name__).warning(
                        "Attempt %d/%d failed (%s), retrying in %.1fs…",
                        attempt, max_attempts, exc, wait,
                    )
                    await asyncio.sleep(wait)
        return wrapper
    return decorator
