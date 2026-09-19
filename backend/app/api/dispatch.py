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

router = APIRouter(prefix="/dispatch", tags=["Dispatch"])

DISPATCH_STORE: Dict[str, dict] = {}


@router.post("", response_model=DispatchResponse, status_code=status.HTTP_201_CREATED)
def create_dispatch(payload: DispatchCreate):
    if payload.emergency_id not in EMERGENCY_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency '{payload.emergency_id}' not found"
        )

    emergency_rec = EMERGENCY_STORE[payload.emergency_id]
    dispatch_id = f"dsp_{uuid.uuid4().hex[:8]}"
    reservation_id = f"res_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

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


@router.get("", response_model=List[DispatchResponse])
def list_dispatches():
    return [DispatchResponse(**d) for d in DISPATCH_STORE.values()]


@router.get("/{dispatch_id}", response_model=DispatchResponse)
def get_dispatch(dispatch_id: str):
    if dispatch_id not in DISPATCH_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch '{dispatch_id}' not found"
        )
    return DispatchResponse(**DISPATCH_STORE[dispatch_id])


@router.put("/{dispatch_id}/status", response_model=DispatchResponse)
def update_dispatch_status(dispatch_id: str, payload: DispatchStatusUpdate):
    if dispatch_id not in DISPATCH_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch '{dispatch_id}' not found"
        )

    dispatch_rec = DISPATCH_STORE[dispatch_id]
    dispatch_rec["status"] = payload.status
    if payload.notes:
        dispatch_rec["notes"] = payload.notes

    emergency_id = dispatch_rec["emergency_id"]
    if emergency_id in EMERGENCY_STORE and payload.status == DispatchStatus.ARRIVED:
        EMERGENCY_STORE[emergency_id]["status"] = EmergencyStatus.ARRIVED

    return DispatchResponse(**dispatch_rec)
