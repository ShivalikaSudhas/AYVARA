"""P4 — WebSocket connection manager and room handling.

This module initialises the python-socketio AsyncServer and provides
helper coroutines for room management and broadcasts.  The single
`sio` instance is imported everywhere else in the P4 layer.

Rooms follow the convention:
    hospital:<hospital_id>     — per-hospital room
    dispatchers                — all EMT / dispatcher clients
    admins                     — all admin clients
    all                        — global broadcast room (joined by everyone)
"""

import logging
from datetime import datetime, timezone
from typing import Any, Optional

import os

import socketio  # type: ignore[import-not-found]

logger = logging.getLogger("p4.socket_manager")

# SOCKET_CORS_ORIGIN can be set via env or falls back to the dev frontend URL.
# We intentionally do NOT import app.config.settings here to keep the
# socket_manager importable in test contexts without a full .env file.
_CORS_ORIGIN: str = os.getenv("SOCKET_CORS_ORIGIN", "http://localhost:5173")

# ---------------------------------------------------------------------------
# AsyncServer instance (shared across all P4 modules)
# ---------------------------------------------------------------------------
sio: socketio.AsyncServer = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=_CORS_ORIGIN,
    logger=False,
    engineio_logger=False,
)


# ---------------------------------------------------------------------------
# Connection lifecycle handlers
# ---------------------------------------------------------------------------
@sio.event
async def connect(sid: str, environ: dict, auth: Optional[dict] = None) -> None:
    """Called when a client successfully connects."""
    logger.info("Client connected: sid=%s", sid)
    # All clients automatically join the global room
    await sio.enter_room(sid, "all")


@sio.event
async def disconnect(sid: str) -> None:
    """Called when a client disconnects."""
    logger.info("Client disconnected: sid=%s", sid)


# ---------------------------------------------------------------------------
# Client-emitted room management events
# ---------------------------------------------------------------------------
@sio.event
async def join_hospital_room(sid: str, data: dict) -> dict:
    """Client asks to join a hospital-specific room.

    Expected payload: {"hospital_id": "hosp_001"}
    """
    hospital_id = data.get("hospital_id")
    if not hospital_id:
        return {"ok": False, "error": "hospital_id required"}

    room = f"hospital:{hospital_id}"
    await sio.enter_room(sid, room)
    logger.info("sid=%s joined room=%s", sid, room)
    return {"ok": True, "room": room}


@sio.event
async def leave_hospital_room(sid: str, data: dict) -> dict:
    """Client asks to leave a hospital-specific room.

    Expected payload: {"hospital_id": "hosp_001"}
    """
    hospital_id = data.get("hospital_id")
    if not hospital_id:
        return {"ok": False, "error": "hospital_id required"}

    room = f"hospital:{hospital_id}"
    await sio.leave_room(sid, room)
    logger.info("sid=%s left room=%s", sid, room)
    return {"ok": True, "room": room}


@sio.event
async def join_role_room(sid: str, data: dict) -> dict:
    """Client asks to join a role-based room.

    Expected payload: {"role": "admin" | "dispatcher"}
    """
    role = data.get("role", "").lower()
    if role not in {"admin", "dispatcher"}:
        return {"ok": False, "error": "role must be 'admin' or 'dispatcher'"}

    await sio.enter_room(sid, role + "s")
    logger.info("sid=%s joined role room=%s", sid, role + "s")
    return {"ok": True, "room": role + "s"}


# ---------------------------------------------------------------------------
# Broadcast helpers (called by event emitters and API handlers)
# ---------------------------------------------------------------------------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def broadcast_to_room(
    event: str,
    data: dict,
    room: str = "all",
    skip_sid: Optional[str] = None,
) -> None:
    """Emit *event* with *data* to every client in *room*."""
    payload = {**data, "timestamp": _now_iso()}
    await sio.emit(event, payload, room=room, skip_sid=skip_sid)
    logger.debug("emitted event=%s room=%s payload=%s", event, room, payload)


async def broadcast_bed_update(
    hospital_id: str,
    dept_id: str,
    available_beds: int,
    bed_type: str = "general",
    extra: Optional[dict] = None,
) -> None:
    """Broadcast a bed_update event to the relevant hospital room + global."""
    payload: dict[str, Any] = {
        "event": "bed_update",
        "hospital_id": hospital_id,
        "dept_id": dept_id,
        "available_beds": available_beds,
        "bed_type": bed_type,
    }
    if extra:
        payload.update(extra)
    await broadcast_to_room("bed_update", payload, room=f"hospital:{hospital_id}")
    await broadcast_to_room("bed_update", payload, room="all")


async def broadcast_emergency_alert(
    emergency_id: str,
    severity: str,
    patient_condition: str,
    latitude: float,
    longitude: float,
    eta: int,
    hospital_id: Optional[str] = None,
) -> None:
    """Broadcast an emergency_alert event to dispatchers and all clients."""
    payload: dict[str, Any] = {
        "event": "emergency_alert",
        "emergency_id": emergency_id,
        "severity": severity,
        "patient_condition": patient_condition,
        "latitude": latitude,
        "longitude": longitude,
        "eta": eta,
    }
    if hospital_id:
        payload["hospital_id"] = hospital_id
    await broadcast_to_room("emergency_alert", payload, room="dispatchers")
    await broadcast_to_room("emergency_alert", payload, room="all")


async def broadcast_dispatch_update(
    dispatch_id: str,
    emergency_id: str,
    hospital_id: str,
    ambulance_unit: str,
    status: str,
    estimated_arrival_minutes: int,
) -> None:
    """Broadcast a dispatch_update event."""
    payload: dict[str, Any] = {
        "event": "dispatch_update",
        "dispatch_id": dispatch_id,
        "emergency_id": emergency_id,
        "hospital_id": hospital_id,
        "ambulance_unit": ambulance_unit,
        "status": status,
        "estimated_arrival_minutes": estimated_arrival_minutes,
    }
    await broadcast_to_room("dispatch_update", payload, room=f"hospital:{hospital_id}")
    await broadcast_to_room("dispatch_update", payload, room="dispatchers")
    await broadcast_to_room("dispatch_update", payload, room="all")


async def broadcast_resource_change(
    hospital_id: str,
    resource_type: str,
    resource_name: str,
    available_quantity: int,
    unit: str = "units",
) -> None:
    """Broadcast a resource_change event."""
    payload: dict[str, Any] = {
        "event": "resource_change",
        "hospital_id": hospital_id,
        "resource_type": resource_type,
        "resource_name": resource_name,
        "available_quantity": available_quantity,
        "unit": unit,
    }
    await broadcast_to_room("resource_change", payload, room=f"hospital:{hospital_id}")
    await broadcast_to_room("resource_change", payload, room="all")


async def broadcast_disaster_activated(
    disaster_mode: bool,
    region: str,
    notes: str,
    activated_by: str = "admin",
) -> None:
    """Broadcast disaster_activated / disaster_deactivated to ALL clients."""
    event_name = "disaster_activated" if disaster_mode else "disaster_deactivated"
    payload: dict[str, Any] = {
        "event": event_name,
        "disaster_mode": disaster_mode,
        "region": region,
        "notes": notes,
        "activated_by": activated_by,
    }
    await broadcast_to_room(event_name, payload, room="all")
