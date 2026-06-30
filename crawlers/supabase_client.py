"""
Supabase REST API client for write operations.
Uses the service-role key (bypasses RLS) so crawlers can upsert any row.
"""

import httpx
import logging
from typing import Any
from config import Config

logger = logging.getLogger(__name__)


class SupabaseClient:
    def __init__(self):
        self.url = Config.SUPABASE_URL.rstrip("/")
        self.key = Config.SUPABASE_SERVICE_KEY
        self._base_headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    # ── Read ──────────────────────────────────────────────────────────────────

    async def select(
        self,
        table: str,
        columns: str = "*",
        eq: dict | None = None,
    ) -> list[dict]:
        params: dict[str, Any] = {"select": columns}
        if eq:
            for col, val in eq.items():
                params[col] = f"eq.{val}"
        async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
            resp = await client.get(
                f"{self.url}/rest/v1/{table}",
                headers=self._base_headers,
                params=params,
            )
            resp.raise_for_status()
            return resp.json()

    # ── Write ─────────────────────────────────────────────────────────────────

    async def upsert(
        self,
        table: str,
        records: list[dict],
        on_conflict: str,
    ) -> list[dict]:
        """
        Insert or update rows.  on_conflict is the column (or comma-separated
        columns) that form the unique key for conflict detection.
        """
        if not records:
            return []

        headers = {
            **self._base_headers,
            "Prefer": f"resolution=merge-duplicates,return=representation",
        }
        async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
            resp = await client.post(
                f"{self.url}/rest/v1/{table}",
                json=records,
                headers=headers,
                params={"on_conflict": on_conflict},
            )
            if resp.status_code not in (200, 201):
                logger.error("Supabase upsert failed [%s]: %s", resp.status_code, resp.text)
            resp.raise_for_status()
            result = resp.json()
            logger.info("Upserted %d rows into %s", len(result), table)
            return result

    async def upsert_one(self, table: str, record: dict, on_conflict: str) -> dict | None:
        rows = await self.upsert(table, [record], on_conflict)
        return rows[0] if rows else None
