"""P4 — Notification delivery endpoints.

GET  /api/v1/notifications              — list notifications
GET  /api/v1/notifications/{id}         — single notification
POST /api/v1/notifications/{id}/read    — mark one as read
POST /api/v1/notifications/read-all     — mark all (optionally scoped) as read
POST /api/v1/notifications/test-emit    — emit a test event (dev only)
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.notification import NotificationCreate, NotificationResponse
from app.services.notification_service import send_notification
from app.websocket.notification_store import (
    get_notification,
    get_notifications,
    mark_all_read,
    mark_as_read,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications (P4)"],
)


@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    hospital_id: Optional[str] = Query(None, description="Filter by hospital"),
    unread_only: bool = Query(False, description="Return only unread notifications"),
    limit: int = Query(100, ge=1, le=500),
):
    """List persisted notifications, optionally scoped to a hospital."""
    records = get_notifications(
        hospital_id=hospital_id,
        unread_only=unread_only,
        limit=limit,
    )
    return [r.to_response() for r in records]


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification_by_id(notification_id: str):
    """Retrieve a single notification by ID."""
    record = get_notification(notification_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found",
        )
    return record.to_response()


@router.post(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
async def mark_notification_read(notification_id: str):
    """Mark a single notification as read."""
    record = mark_as_read(notification_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found",
        )
    return record.to_response()


@router.post("/read-all", response_model=dict)
async def mark_all_notifications_read(
    hospital_id: Optional[str] = Query(None),
):
    """Mark all notifications as read, optionally scoped to a hospital."""
    count = mark_all_read(hospital_id=hospital_id)
    return {"ok": True, "marked_read": count}


@router.post("/test-emit", response_model=dict, status_code=status.HTTP_201_CREATED)
async def test_emit_notification(payload: NotificationCreate):
    """Emit a test notification over Socket.IO (development / demo use).

    This endpoint is not auth-guarded intentionally to allow P1 to verify
    the Socket.IO connection without needing a JWT implementation from P2.
    Remove or guard this in production.
    """
    result = await send_notification(
        event_type=payload.event_type,
        title=payload.title,
        message=payload.message,
        severity=payload.severity,
        hospital_id=payload.recipient_hospital_id,
        meta=payload.meta,
    )
    return {"ok": True, "notification": result}
