"""P4 — Disaster mode coordination and escalation service.

Maintains in-process disaster mode state and broadcasts to all Socket.IO
clients when activated or deactivated.

Admin-only: authorization is enforced at the API layer via a lightweight
P4-owned role check (see app/api/disaster.py).

When P2 delivers auth, replace `_check_admin_role` with their dependency.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from app.services.notification_service import send_notification
from app.websocket.socket_manager import broadcast_disaster_activated

logger = logging.getLogger("p4.disaster_mode")


# ---------------------------------------------------------------------------
# In-process state
# ---------------------------------------------------------------------------

class _DisasterState:
    """Singleton mutable disaster mode state."""

    def __init__(self) -> None:
        self.active: bool = False
        self.region: str = ""
        self.notes: str = ""
        self.activated_at: Optional[datetime] = None
        self.deactivated_at: Optional[datetime] = None
        self.activated_by: str = ""

    def to_dict(self) -> dict:
        return {
            "disaster_mode": self.active,
            "region": self.region,
            "notes": self.notes,
            "activated_at": self.activated_at.isoformat() if self.activated_at else None,
            "deactivated_at": self.deactivated_at.isoformat() if self.deactivated_at else None,
            "activated_by": self.activated_by,
        }


_state = _DisasterState()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_disaster_status() -> dict:
    """Return current disaster mode status (safe to call any time)."""
    return _state.to_dict()


async def activate_disaster_mode(
    region: str,
    notes: str,
    activated_by: str,
) -> dict:
    """Activate disaster mode and broadcast to all connected clients.

    Args:
        region: Affected region description.
        notes: Free-text notes (e.g. "Mass Casualty Incident - Level 3").
        activated_by: Username / user ID of the activating admin.

    Returns:
        Current disaster state dict with "status": "activated".
    """
    now = datetime.now(timezone.utc)
    _state.active = True
    _state.region = region
    _state.notes = notes
    _state.activated_at = now
    _state.deactivated_at = None
    _state.activated_by = activated_by

    logger.warning(
        "DISASTER MODE ACTIVATED: region=%s by=%s notes=%s",
        region, activated_by, notes,
    )

    # Broadcast Socket.IO event to all rooms
    await broadcast_disaster_activated(
        disaster_mode=True,
        region=region,
        notes=notes,
        activated_by=activated_by,
    )

    # Persist + deliver notification
    await send_notification(
        event_type="disaster_activated",
        title="⚠️ DISASTER MODE ACTIVATED",
        message=f"Region: {region}. {notes}",
        severity="critical",
        hospital_id=None,  # global
        meta={
            "region": region,
            "activated_by": activated_by,
            "activated_at": now.isoformat(),
        },
    )

    return {"status": "activated", "timestamp": now.isoformat(), **_state.to_dict()}


async def deactivate_disaster_mode(deactivated_by: str) -> dict:
    """Deactivate disaster mode and broadcast to all connected clients.

    Args:
        deactivated_by: Username / user ID of the deactivating admin.

    Returns:
        Current disaster state dict with "status": "deactivated".
    """
    now = datetime.now(timezone.utc)
    _state.active = False
    _state.deactivated_at = now

    logger.info("DISASTER MODE DEACTIVATED by=%s", deactivated_by)

    await broadcast_disaster_activated(
        disaster_mode=False,
        region=_state.region,
        notes=f"Disaster mode deactivated by {deactivated_by}",
        activated_by=deactivated_by,
    )

    await send_notification(
        event_type="disaster_deactivated",
        title="Disaster Mode Deactivated",
        message=f"Disaster mode has been lifted by {deactivated_by}.",
        severity="info",
        hospital_id=None,
        meta={"deactivated_by": deactivated_by, "deactivated_at": now.isoformat()},
    )

    return {"status": "deactivated", "timestamp": now.isoformat(), **_state.to_dict()}
