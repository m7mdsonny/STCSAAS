import json
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

from loguru import logger

from config.settings import settings


class LocalLicenseStore:
    """Persist license validation data locally to allow offline grace periods."""

    def __init__(self, path: Optional[str] = None):
        self.path = Path(path or settings.license_cache_path)
        self.data: Dict[str, Any] = {}
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            self.data = {}
            return

        try:
            with self.path.open("r", encoding="utf-8") as f:
                self.data = json.load(f)
        except Exception as exc:
            logger.warning(f"Failed to load license cache: {exc}")
            self.data = {}

    def save(self) -> None:
        try:
            with self.path.open("w", encoding="utf-8") as f:
                json.dump(self.data, f, default=str)
        except Exception as exc:
            logger.warning(f"Failed to persist license cache: {exc}")

    def update_from_cloud(self, license_key: str, payload: Dict[str, Any], hardware_id: Optional[str]) -> None:
        expires_at = payload.get("expires_at")
        grace_days = payload.get("grace_days", 14)
        license_id = payload.get("license_id")
        organization_id = payload.get("organization_id")

        self.data = {
            "license_key": license_key,
            "license_id": license_id,
            "organization_id": organization_id,
            "expires_at": expires_at,
            "grace_days": grace_days,
            "hardware_id": hardware_id,
            "last_validated": datetime.utcnow().isoformat(),
        }
        self.save()

    def is_within_grace(self, license_key: str, hardware_id: Optional[str]) -> bool:
        if not self.data:
            return False

        cached_key = self.data.get("license_key")
        cached_hw = self.data.get("hardware_id")

        if cached_key != license_key:
            return False

        if cached_hw and hardware_id and cached_hw != hardware_id:
            return False

        try:
            expires_at = self._parse_date(self.data.get("expires_at"))
        except Exception:
            return False

        grace_days = int(self.data.get("grace_days", 14))
        grace_limit = expires_at + timedelta(days=grace_days)
        today = date.today()

        return today <= grace_limit

    def _parse_date(self, value: Any) -> date:
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            return datetime.fromisoformat(value).date()
        raise ValueError("Unsupported date format")
