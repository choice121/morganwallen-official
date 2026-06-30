"""
Tour Dates crawler — Bandsintown public events API.

Populates:
  • tour_dates (event_date, event_time, city, state, country,
                venue, ticket_url, is_sold_out, is_cancelled)

Bandsintown's events endpoint is publicly accessible with any app_id string.
"""

import asyncio
import logging
from datetime import datetime, timezone

import httpx

from config import Config
from supabase_client import SupabaseClient
from utils import retry

logger = logging.getLogger(__name__)

BANDSINTOWN_URL = "https://rest.bandsintown.com/artists/morgan%20wallen/events"
APP_ID = "morganwallen-official-site"


# ── Fetch ─────────────────────────────────────────────────────────────────────

@retry(max_attempts=3)
async def _fetch_events(client: httpx.AsyncClient) -> list[dict]:
    resp = await client.get(
        BANDSINTOWN_URL,
        params={"app_id": APP_ID, "date": "upcoming"},
        timeout=Config.REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, dict) and data.get("error"):
        raise ValueError(f"Bandsintown error: {data['error']}")
    return data if isinstance(data, list) else []


# ── Transform ─────────────────────────────────────────────────────────────────

def _parse_event(event: dict) -> dict | None:
    try:
        venue = event.get("venue", {})
        dt_raw = event.get("datetime", "")
        if not dt_raw:
            return None

        # Parse ISO datetime string  e.g. "2025-06-15T19:00:00"
        try:
            dt = datetime.fromisoformat(dt_raw.replace("Z", "+00:00"))
        except ValueError:
            dt = datetime.fromisoformat(dt_raw[:19])

        event_date = dt.strftime("%Y-%m-%d")
        event_time = dt.strftime("%I:%M %p").lstrip("0")   # "7:00 PM"

        # Determine ticket URL from offers
        ticket_url = event.get("url", "")
        for offer in event.get("offers", []):
            if offer.get("type", "").lower() == "tickets":
                ticket_url = offer.get("url", ticket_url)
                break

        # Determine sold-out status
        is_sold_out = False
        for offer in event.get("offers", []):
            if offer.get("status", "").lower() in ("sold_out", "unavailable"):
                is_sold_out = True
                break

        return {
            "event_date": event_date,
            "event_time": event_time,
            "city": venue.get("city", ""),
            "state": venue.get("region", "") or "",
            "country": venue.get("country", "United States"),
            "venue": venue.get("name", ""),
            "ticket_url": ticket_url or None,
            "is_sold_out": is_sold_out,
            "is_cancelled": event.get("cancelled", False),
        }
    except Exception as exc:
        logger.warning("Could not parse event: %s — %s", event.get("id"), exc)
        return None


# ── Main ──────────────────────────────────────────────────────────────────────

async def run() -> dict:
    db = SupabaseClient()
    stats = {"tour_dates": 0, "errors": []}

    async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
        logger.info("Fetching tour dates from Bandsintown…")
        try:
            events = await _fetch_events(client)
        except Exception as exc:
            logger.error("Failed to fetch Bandsintown events: %s", exc)
            stats["errors"].append(str(exc))
            return stats

    logger.info("Found %d upcoming events", len(events))

    records = []
    for event in events:
        rec = _parse_event(event)
        if rec and rec["venue"] and rec["event_date"]:
            records.append(rec)

    if records:
        upserted = await db.upsert("tour_dates", records, on_conflict="event_date,venue")
        stats["tour_dates"] = len(upserted)

    logger.info("Tour done: %d dates upserted", stats["tour_dates"])
    return stats


if __name__ == "__main__":
    import utils; utils.setup_logging()
    asyncio.run(run())
