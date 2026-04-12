import json
from pathlib import Path
from typing import Any

import structlog

log = structlog.get_logger()

_tips_data: dict[str, Any] | None = None


def _load_tips() -> dict[str, Any]:
    global _tips_data
    if _tips_data is None:
        tips_path = Path(__file__).parent.parent.parent / "data" / "health_tips.json"
        if tips_path.exists():
            _tips_data = json.loads(tips_path.read_text())
            log.info("health_tips_loaded", version=_tips_data.get("version"))
        else:
            _tips_data = {"tips_by_age": []}
            log.warning("health_tips_file_not_found")
    return _tips_data


def get_tips_for_age(age_months: int, language: str = "en") -> list[dict[str, Any]]:
    """Get health tips appropriate for a child's age."""
    data = _load_tips()
    tips_by_age = data.get("tips_by_age", [])

    for age_group in tips_by_age:
        if age_group["min_age_months"] <= age_months <= age_group["max_age_months"]:
            tips = age_group.get("tips", [])
            result = []
            for tip in tips:
                result.append(
                    {
                        "category": tip.get("category"),
                        "title": tip.get("title"),
                        "content": tip.get("content"),
                        "content_hi": tip.get("hinodi"),
                    }
                )
            return result

    return []


def get_next_tip(age_months: int, category: str | None = None) -> dict[str, Any] | None:
    """Get a single tip for a specific age, optionally filtered by category."""
    tips = get_tips_for_age(age_months)
    if not tips:
        return None

    if category:
        for tip in tips:
            if tip.get("category") == category:
                return tip

    return tips[0] if tips else None
