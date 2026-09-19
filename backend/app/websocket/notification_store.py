"""P4 — In-process notification store (P2 Notification model adapter).

The P2 team owns backend/app/models/notification.py but that file is
currently a stub.  This module provides a complete in-memory notification
store that persists for the lifetime of the process and is compatible
with the Notification schema interface.

When P2 delivers their SQLAlchemy model the `_store` dict can be swapped
for real DB queries without changing any API surface.

Thread / concurrency safety: asyncio single-threaded event loop, no locking needed.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.schemas.notification import NotificationCreate, NotificationResponse

logger = logging.getLogger("p4.notification_store")


class _NotificationRecord:
    """Internal representation of a notification."""

    __slots__ = (
        "id", "recipient_hospital_id", "event_type", "title", "message",
        "severity", "is_read", "created_at", "meta",
    )

    def __init__(
        self,
        *,
        notification_id: str,
        recipient_hospital_id: Optional[str],
        event_type: str,
        title: str,
        message: str,
        severity: str,
        meta: Optional[dict],
    ) -> None:
        self.id = notification_id
        self.recipient_hospital_id = recipient_hospital_id
        self.event_type = event_type
        self.title = title
        self.message = message
        self.severity = severity
        self.is_read = False
        self.created_at = datetime.now(timezone.utc)
        self.meta = meta

    def to_response(self) -> NotificationResponse:
        return NotificationResponse(
            id=self.id,
            recipient_hospital_id=self.recipient_hospital_id,
            event_type=self.event_type,
            title=self.title,
            message=self.message,
            severity=self.severity,
            is_read=self.is_read,
            created_at=self.created_at,
            meta=self.meta,
        )


# In-memory store: notification_id → record
_store: Dict[str, _NotificationRecord] = {}


# ---------------------------------------------------------------------------
# Public API consumed by notification_service and the API router
# ---------------------------------------------------------------------------

def create_notification(payload: NotificationCreate) -> _NotificationRecord:
    """Persist a new notification and return the record."""
    notification_id = f"notif_{uuid.uuid4().hex[:10]}"
    record = _NotificationRecord(
        notification_id=notification_id,
        recipient_hospital_id=payload.recipient_hospital_id,
        event_type=payload.event_type,
        title=payload.title,
        message=payload.message,
        severity=payload.severity,
        meta=payload.meta,
    )
    _store[notification_id] = record
    logger.debug("Created notification %s", notification_id)
    return record


def get_notifications(
    hospital_id: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 100,
) -> List[_NotificationRecord]:
    """Retrieve notifications, optionally filtered by hospital or read state."""
    records = list(_store.values())

    if hospital_id is not None:
        records = [
            r for r in records
            if r.recipient_hospital_id is None or r.recipient_hospital_id == hospital_id
        ]

    if unread_only:
        records = [r for r in records if not r.is_read]

    # Most recent first
    records.sort(key=lambda r: r.created_at, reverse=True)
    return records[:limit]


def get_notification(notification_id: str) -> Optional[_NotificationRecord]:
    return _store.get(notification_id)


def mark_as_read(notification_id: str) -> Optional[_NotificationRecord]:
    record = _store.get(notification_id)
    if record:
        record.is_read = True
    return record


def mark_all_read(hospital_id: Optional[str] = None) -> int:
    """Mark all (optionally hospital-scoped) notifications as read.

    Returns:
        Count of notifications that were updated.
    """
    count = 0
    for record in _store.values():
        if hospital_id is not None and record.recipient_hospital_id not in (
            None, hospital_id
        ):
            continue
        if not record.is_read:
            record.is_read = True
            count += 1
    return count
