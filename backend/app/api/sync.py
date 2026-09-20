"""P4 — Data synchronization endpoints for HMIS integration.

POST /api/v1/sync/hmis         — trigger one HMIS sync cycle (admin)
GET  /api/v1/sync/hmis/health  — HMIS connection health status
GET  /api/v1/sync/hmis/resources — current resource cache (all hospitals)
"""

from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException, Query, status
from typing import List, Optional

from app.services.hmis_sync import (
    sync_resources,
    get_health_status,
    get_all_resources,
)

router = APIRouter(prefix="/sync", tags=["HMIS Sync (P4)"])


# Reuse the same lightweight admin guard as disaster.py
def _require_admin(
    authorization: Optional[str] = None,
    role: Optional[str] = None,
    admin_id: Optional[str] = None,
) -> str:
    if authorization:
        parts = authorization.split(" ", 1)
        if len(parts) == 2 and parts[1].startswith("admin:"):
            return parts[1].split(":", 1)[1] or "admin"
    if role and role.lower() == "admin":
        return "admin"
    if admin_id:
        return admin_id
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin role required for HMIS sync.",
    )


@router.post("/hmis")
async def trigger_hmis_sync(
    authorization: Optional[str] = Header(None),
    role: Optional[str] = Query(None),
    admin_id: Optional[str] = Query(None),
    emit_events: bool = Query(True, description="Emit resource_change Socket.IO events"),
):
    """Trigger one HMIS synchronization cycle (admin-only)."""
    _require_admin(authorization=authorization, role=role, admin_id=admin_id)
    result = await sync_resources(emit_events=emit_events)
    return result


@router.get("/hmis/health")
async def hmis_health():
    """Return HMIS connection health status."""
    return get_health_status()


@router.get("/hmis/resources")
async def list_synced_resources():
    """Return the current HMIS resource cache for all hospitals."""
    return {"resources": get_all_resources()}
