"""P3 — Ambulance dispatch handling endpoints."""

from datetime import datetime, timezone
import uuid
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status
from app.schemas.dispatch import (
    DispatchCreate,
    DispatchResponse,
    DispatchStatus,
    DispatchStatusUpdate
)
from app.api.emergency import EMERGENCY_STORE, EmergencyStatus

router = APIRouter(prefix="/dispatch", tags=["Ambulance Dispatch"])

DISPATCH_STORE: Dict[str, dict] = {}


@router.post(
    "",
    response_model=DispatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Dispatch ambulance & confirm bed reservation"
)
def create_dispatch(payload: DispatchCreate):
    """
    Confirms hospital selection for an emergency incident, reserves a bed,
    assigns an ambulance unit, and initializes dispatch status.
    """
    if payload.emergency_id not in EMERGENCY_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency ID '{payload.emergency_id}' not found."
        )

    emergency_rec = EMERGENCY_STORE[payload.emergency_id]
    dispatch_id = f"dsp_{uuid.uuid4().hex[:8]}"
    reservation_id = f"res_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

    # Update emergency record status
    emergency_rec["status"] = EmergencyStatus.DISPATCHED
    emergency_rec["selected_hospital_id"] = payload.selected_hospital_id

    dispatch_record = {
        "dispatch_id": dispatch_id,
        "emergency_id": payload.emergency_id,
        "selected_hospital_id": payload.selected_hospital_id,
        "hospital_name": "City General Hospital" if payload.selected_hospital_id == "hosp_001" else "Matched Hospital",
        "ambulance_unit": payload.ambulance_unit,
        "reservation_id": reservation_id,
        "status": DispatchStatus.EN_ROUTE,
        "dispatched_at": now,
        "estimated_arrival_minutes": 8,
        "notes": payload.notes
    }
    DISPATCH_STORE[dispatch_id] = dispatch_record

    return DispatchResponse(**dispatch_record)


@router.get(
    "",
    response_model=List[DispatchResponse],
    summary="List all active ambulance dispatches"
)
def list_dispatches():
    """Returns a list of all current ambulance dispatch units."""
    return [DispatchResponse(**d) for d in DISPATCH_STORE.values()]


@router.get(
    "/{dispatch_id}",
    response_model=DispatchResponse,
    summary="Get dispatch status by ID"
)
def get_dispatch(dispatch_id: str):
    """Retrieves dispatch tracking details by ID."""
    if dispatch_id not in DISPATCH_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch record '{dispatch_id}' not found."
        )
    return DispatchResponse(**DISPATCH_STORE[dispatch_id])


@router.put(
    "/{dispatch_id}/status",
    response_model=DispatchResponse,
    summary="Update dispatch status (en_route -> arrived -> completed)"
)
def update_dispatch_status(dispatch_id: str, payload: DispatchStatusUpdate):
    """Updates status for an active dispatch unit (e.g. arrived at hospital, completed handover)."""
    if dispatch_id not in DISPATCH_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch record '{dispatch_id}' not found."
        )

    dispatch_rec = DISPATCH_STORE[dispatch_id]
    dispatch_rec["status"] = payload.status
    if payload.notes:
        dispatch_rec["notes"] = payload.notes

    # Update associated emergency status if completed/arrived
    emergency_id = dispatch_rec["emergency_id"]
    if emergency_id in EMERGENCY_STORE:
        if payload.status == DispatchStatus.ARRIVED:
            EMERGENCY_STORE[emergency_id]["status"] = EmergencyStatus.ARRIVED

    return DispatchResponse(**dispatch_rec)
