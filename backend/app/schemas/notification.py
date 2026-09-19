"""P4 — Notification Pydantic schema definitions.

These schemas are owned by P4 since the P2 Notification schema stub
has not been implemented yet.  When P2 delivers their schema, these
should be reconciled / replaced by P2's canonical definitions.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    """Payload required to create a new notification."""

    recipient_hospital_id: Optional[str] = None
    """If None the notification is global (e.g. disaster alerts)."""

    event_type: str
    """Matches a Socket.IO event name, e.g. 'emergency_alert', 'bed_update'."""

    title: str
    message: str
    severity: str = "info"
    """info | warning | critical"""

    meta: Optional[dict] = None
    """Arbitrary extra data (e.g. emergency_id, dispatch_id)."""


class NotificationResponse(BaseModel):
    """Notification as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    recipient_hospital_id: Optional[str] = None
    event_type: str
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime
    meta: Optional[dict] = None
