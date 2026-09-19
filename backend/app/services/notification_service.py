"""P4 — Push notification delivery service.

Persists a notification via the in-process store and simultaneously
emits it over Socket.IO so connected clients receive it immediately.

Usage:
    from app.services.notification_service import send_notification
    await send_notification(
        event_type="emergency_alert",
        title="New Emergency",
        message="Cardiac arrest at 40.73, -73.93",
        severity="critical",
        hospital_id="hosp_001",
        meta={"emergency_id": "emg_abc123"},
    )
"""

from __future__ import annotations

import logging
from typing import Optional

from app.schemas.notification import NotificationCreate
from app.websocket.notification_store import create_notification
from app.websocket.socket_manager import sio, _now_iso

logger = logging.getLogger("p4.notification_service")


async def send_notification(
    event_type: str,
    title: str,
    message: str,
    severity: str = "info",
    hospital_id: Optional[str] = None,
    meta: Optional[dict] = None,
) -> dict:
    """Persist + emit a notification.

    Args:
        event_type: Socket.IO event name this notification maps to.
        title:      Short notification title.
        message:    Full human-readable message.
        severity:   "info" | "warning" | "critical".
        hospital_id: Target hospital (None = global).
        meta:       Optional extra key/value context.

    Returns:
        The persisted notification as a dict.
    """
    payload = NotificationCreate(
        recipient_hospital_id=hospital_id,
        event_type=event_type,
        title=title,
        message=message,
        severity=severity,
        meta=meta,
    )
    record = create_notification(payload)

    # Determine target Socket.IO room
    room = f"hospital:{hospital_id}" if hospital_id else "all"

    socket_payload = {
        "notification_id": record.id,
        "event_type": record.event_type,
        "title": record.title,
        "message": record.message,
        "severity": record.severity,
        "is_read": record.is_read,
        "created_at": record.created_at.isoformat(),
        "meta": record.meta or {},
        "timestamp": _now_iso(),
    }

    try:
        await sio.emit("notification", socket_payload, room=room)
        if hospital_id:
            # Also emit to global room so admin dashboards receive it
            await sio.emit("notification", socket_payload, room="all")
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to emit notification via Socket.IO: %s", exc)

    logger.info(
        "Notification sent: id=%s event=%s severity=%s hospital=%s",
        record.id, event_type, severity, hospital_id,
    )
    return record.to_response().model_dump()
