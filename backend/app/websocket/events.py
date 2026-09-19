"""P4 — WebSocket event definitions and integration hooks.

This module wires P4's socket broadcasts into the post-commit lifecycle
of the P3 emergency / dispatch flows WITHOUT modifying P3 files.

Usage (from P3 API handlers after db.commit()):
    from app.websocket.events import after_emergency_created
    await after_emergency_created(emergency_id, severity, ...)

All functions are async and safe to call from FastAPI route handlers.
"""

import asyncio
import logging
from typing import Optional

from app.websocket.socket_manager import (
    broadcast_bed_update,
    broadcast_dispatch_update,
    broadcast_emergency_alert,
    broadcast_resource_change,
)

logger = logging.getLogger("p4.events")


# ---------------------------------------------------------------------------
# Post-commit hooks — call these from P3/P2 route handlers AFTER db.commit()
# ---------------------------------------------------------------------------

async def after_emergency_created(
    emergency_id: str,
    severity: str,
    patient_condition: str,
    latitude: float,
    longitude: float,
    eta: int = 8,
    hospital_id: Optional[str] = None,
) -> None:
    """Emit emergency_alert after a new emergency is committed to DB."""
    try:
        await broadcast_emergency_alert(
            emergency_id=emergency_id,
            severity=severity,
            patient_condition=patient_condition,
            latitude=latitude,
            longitude=longitude,
            eta=eta,
            hospital_id=hospital_id,
        )
        logger.info("emergency_alert emitted for %s", emergency_id)
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to emit emergency_alert: %s", exc)


async def after_dispatch_created(
    dispatch_id: str,
    emergency_id: str,
    hospital_id: str,
    ambulance_unit: str,
    status: str,
    estimated_arrival_minutes: int,
) -> None:
    """Emit dispatch_update after a dispatch is committed to DB."""
    try:
        await broadcast_dispatch_update(
            dispatch_id=dispatch_id,
            emergency_id=emergency_id,
            hospital_id=hospital_id,
            ambulance_unit=ambulance_unit,
            status=status,
            estimated_arrival_minutes=estimated_arrival_minutes,
        )
        logger.info("dispatch_update emitted for %s", dispatch_id)
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to emit dispatch_update: %s", exc)


async def after_bed_status_changed(
    hospital_id: str,
    dept_id: str,
    available_beds: int,
    bed_type: str = "general",
) -> None:
    """Emit bed_update after a bed status change is committed to DB."""
    try:
        await broadcast_bed_update(
            hospital_id=hospital_id,
            dept_id=dept_id,
            available_beds=available_beds,
            bed_type=bed_type,
        )
        logger.info(
            "bed_update emitted hospital=%s dept=%s avail=%d",
            hospital_id, dept_id, available_beds,
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to emit bed_update: %s", exc)


async def after_resource_changed(
    hospital_id: str,
    resource_type: str,
    resource_name: str,
    available_quantity: int,
    unit: str = "units",
) -> None:
    """Emit resource_change after a resource update is committed to DB."""
    try:
        await broadcast_resource_change(
            hospital_id=hospital_id,
            resource_type=resource_type,
            resource_name=resource_name,
            available_quantity=available_quantity,
            unit=unit,
        )
        logger.info("resource_change emitted for hospital=%s", hospital_id)
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to emit resource_change: %s", exc)


def fire_and_forget(coro) -> None:
    """Schedule an async coroutine from a sync context (e.g. SQLAlchemy event).

    Example:
        fire_and_forget(after_bed_status_changed(...))
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro)
    except RuntimeError:
        # No event loop running — run synchronously (test context)
        asyncio.run(coro)
