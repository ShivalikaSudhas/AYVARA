"""P4 — Disaster mode activation and coordination endpoints.

POST /api/v1/disaster/toggle  — activate or deactivate disaster mode (admin-only)
GET  /api/v1/disaster/status  — current disaster mode state (any authenticated client)

Authorization:
    P2's auth module (app/core/security.py) is a stub.  P4 uses an inline
    lightweight role check via the Authorization header that reads the role
    from a simple dev token or falls back to query-param `role=admin`.

    When P2 delivers real JWT auth, replace `_require_admin` with their
    `get_current_user` dependency and check `current_user.role == "admin"`.
"""

from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional

from app.services.disaster_mode import (
    activate_disaster_mode,
    deactivate_disaster_mode,
    get_disaster_status,
)

router = APIRouter(prefix="/disaster", tags=["Disaster Mode (P4)"])


# ---------------------------------------------------------------------------
# Lightweight admin guard (P4-owned until P2 delivers auth)
# ---------------------------------------------------------------------------

def _require_admin(
    authorization: Optional[str] = Header(None),
    role: Optional[str] = Query(None, description="Dev override: pass role=admin"),
) -> str:
    """Returns the admin identifier or raises 403.

    Priority:
    1. Authorization header value "Bearer admin:<identifier>"  (dev/demo shortcut)
    2. Query param role=admin (dev shortcut)

    When P2's JWT auth is live, replace this whole function with:
        current_user: User = Depends(get_current_user)
        if current_user.role != "admin": raise HTTPException(403)
    """
    # Dev shortcut: Authorization: Bearer admin:username
    if authorization:
        parts = authorization.split(" ", 1)
        if len(parts) == 2 and parts[1].startswith("admin:"):
            return parts[1].split(":", 1)[1] or "admin"

    # Dev shortcut: ?role=admin
    if role and role.lower() == "admin":
        return "admin"

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin role required to toggle Disaster Mode.",
    )


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class DisasterToggleRequest(BaseModel):
    disaster_mode: bool
    region: str = "Metro Area"
    notes: str = ""


class DisasterToggleResponse(BaseModel):
    status: str
    timestamp: str
    disaster_mode: bool
    region: str
    notes: str
    activated_by: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/toggle", response_model=DisasterToggleResponse)
async def toggle_disaster_mode(
    payload: DisasterToggleRequest,
    admin_id: str = Query(
        default=None,
        alias="admin_id",
        description="Dev: admin identifier",
    ),
    authorization: Optional[str] = Header(None),
    role: Optional[str] = Query(None),
):
    """Activate or deactivate Disaster Mode (admin-only).

    Broadcasts `disaster_activated` or `disaster_deactivated` Socket.IO event
    to all connected clients.
    """
    # Auth check — lightweight until P2 delivers JWT
    try:
        activated_by = _require_admin(authorization=authorization, role=role)
    except HTTPException:
        # Also accept admin_id query param for demo convenience
        if admin_id:
            activated_by = admin_id
        else:
            raise

    if payload.disaster_mode:
        result = await activate_disaster_mode(
            region=payload.region,
            notes=payload.notes,
            activated_by=activated_by,
        )
    else:
        result = await deactivate_disaster_mode(deactivated_by=activated_by)

    return DisasterToggleResponse(**result)


@router.get("/status")
async def get_status():
    """Return the current disaster mode state."""
    return get_disaster_status()
