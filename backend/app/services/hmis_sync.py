"""P4 — HMIS Sync service.

Provides a simulated HMIS (Hospital Management Information System) data
synchronization service.  Emits `resource_change` Socket.IO events when
resource data changes.

Architecture:
    External HMIS  →  sync_resources()  →  in-memory resource state
                                        ↓
                                    resource_change Socket.IO event

Does NOT modify the P2-owned resources API or hospital models.
"""

from __future__ import annotations

import logging
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.websocket.socket_manager import broadcast_resource_change

logger = logging.getLogger("p4.hmis_sync")


# ---------------------------------------------------------------------------
# Simulated HMIS resource data (in-process state)
# ---------------------------------------------------------------------------

_HMIS_HOSPITALS: List[dict] = [
    {"id": "hosp_001", "name": "City General Hospital"},
    {"id": "hosp_002", "name": "St. Jude Emergency Center"},
    {"id": "hosp_003", "name": "Metropolitan Medical Institute"},
    {"id": "hosp_004", "name": "Mercy Community Care"},
]

_RESOURCE_TYPES = [
    {"type": "ventilator", "name": "Mechanical Ventilator", "unit": "units"},
    {"type": "blood_bank", "name": "O-Negative Blood", "unit": "units"},
    {"type": "oxygen",     "name": "Oxygen Cylinders",    "unit": "cylinders"},
    {"type": "ppe",        "name": "PPE Kits",            "unit": "kits"},
    {"type": "defibrillator", "name": "AED Defibrillator", "unit": "units"},
]

# Internal cache: (hospital_id, resource_type) → quantity
_resource_cache: Dict[tuple, int] = {}

# Connection health
_last_sync_at: Optional[datetime] = None
_sync_count: int = 0


def _get_simulated_quantity(hospital_id: str, resource_type: str) -> int:
    """Simulate HMIS returning a resource quantity with slight variance."""
    base = {
        "ventilator": 12,
        "blood_bank": 20,
        "oxygen": 50,
        "ppe": 200,
        "defibrillator": 8,
    }.get(resource_type, 10)

    # Hospital-specific multiplier
    multiplier = {
        "hosp_001": 1.0,
        "hosp_002": 0.6,
        "hosp_003": 1.5,
        "hosp_004": 0.4,
    }.get(hospital_id, 1.0)

    raw = int(base * multiplier)
    return max(0, raw + random.randint(-2, 2))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def sync_resources(emit_events: bool = True) -> dict:
    """Run one synchronization cycle.

    Fetches (simulated) resource data for all hospitals and emits
    resource_change Socket.IO events for any changed quantities.

    Args:
        emit_events: Set False to suppress Socket.IO emission (testing).

    Returns:
        Sync summary dict.
    """
    global _last_sync_at, _sync_count

    changes: List[dict] = []
    errors: List[str] = []

    for hospital in _HMIS_HOSPITALS:
        hospital_id = hospital["id"]
        for resource in _RESOURCE_TYPES:
            key = (hospital_id, resource["type"])
            try:
                new_qty = _get_simulated_quantity(hospital_id, resource["type"])
                old_qty = _resource_cache.get(key)

                _resource_cache[key] = new_qty

                if old_qty != new_qty:
                    change = {
                        "hospital_id": hospital_id,
                        "hospital_name": hospital["name"],
                        "resource_type": resource["type"],
                        "resource_name": resource["name"],
                        "old_quantity": old_qty,
                        "new_quantity": new_qty,
                        "unit": resource["unit"],
                    }
                    changes.append(change)

                    if emit_events:
                        await broadcast_resource_change(
                            hospital_id=hospital_id,
                            resource_type=resource["type"],
                            resource_name=resource["name"],
                            available_quantity=new_qty,
                            unit=resource["unit"],
                        )
            except Exception as exc:  # noqa: BLE001
                msg = f"Error syncing {hospital_id}/{resource['type']}: {exc}"
                logger.error(msg)
                errors.append(msg)

    _last_sync_at = datetime.now(timezone.utc)
    _sync_count += 1

    logger.info(
        "HMIS sync #%d complete: %d changes, %d errors",
        _sync_count, len(changes), len(errors),
    )

    return {
        "sync_count": _sync_count,
        "changes": len(changes),
        "errors": len(errors),
        "synced_at": _last_sync_at.isoformat(),
        "detail": changes,
        "error_detail": errors,
    }


def get_health_status() -> dict:
    """Return HMIS connection health monitoring data."""
    return {
        "status": "connected",
        "last_sync_at": _last_sync_at.isoformat() if _last_sync_at else None,
        "sync_count": _sync_count,
        "resource_types_tracked": len(_RESOURCE_TYPES),
        "hospitals_tracked": len(_HMIS_HOSPITALS),
        "cached_resources": len(_resource_cache),
    }


def get_all_resources() -> List[dict]:
    """Return the current in-memory resource cache as a flat list."""
    result = []
    for (hospital_id, resource_type), quantity in _resource_cache.items():
        hospital = next(
            (h for h in _HMIS_HOSPITALS if h["id"] == hospital_id), {}
        )
        resource = next(
            (r for r in _RESOURCE_TYPES if r["type"] == resource_type), {}
        )
        result.append({
            "hospital_id": hospital_id,
            "hospital_name": hospital.get("name", ""),
            "resource_type": resource_type,
            "resource_name": resource.get("name", resource_type),
            "available_quantity": quantity,
            "unit": resource.get("unit", "units"),
        })
    return result
