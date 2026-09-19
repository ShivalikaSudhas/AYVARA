from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.session import get_db
from app.models.emergency_request import EmergencyRequest
from app.models.hospital import Hospital
from app.schemas.dispatch import (
    DispatchCreate,
    DispatchResponse,
    DispatchStatus,
    DispatchStatusUpdate,
)
from app.schemas.emergency import EmergencyStatus
router = APIRouter(
    prefix="/dispatch",
    tags=["Dispatch"],
)

DISPATCH_STORE: Dict[str, dict] = {}

@router.post(
    "",
    response_model=DispatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_dispatch(
    payload: DispatchCreate,
    db: Any = Depends(get_db),
):
    # Find emergency in PostgreSQL
    emergency = db.get(
        EmergencyRequest,
        payload.emergency_id,
    )

    if emergency is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency '{payload.emergency_id}' not found",
        )

    # Verify selected hospital exists in PostgreSQL
    hospital = db.get(
        Hospital,
        payload.selected_hospital_id,
    )

    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital '{payload.selected_hospital_id}' not found",
        )

    dispatch_id = f"dsp_{uuid.uuid4().hex[:8]}"
    reservation_id = f"res_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

    # Update emergency in PostgreSQL
    emergency.status = EmergencyStatus.DISPATCHED.value
    emergency.selected_hospital_id = payload.selected_hospital_id

    dispatch_record = {
        "dispatch_id": dispatch_id,
        "emergency_id": payload.emergency_id,
        "selected_hospital_id": payload.selected_hospital_id,
        "hospital_name": hospital.name,
        "ambulance_unit": payload.ambulance_unit,
        "reservation_id": reservation_id,
        "status": DispatchStatus.EN_ROUTE,
        "dispatched_at": now,
        "estimated_arrival_minutes": 8,
        "notes": payload.notes,
    }

    DISPATCH_STORE[dispatch_id] = dispatch_record

    db.commit()
    db.refresh(emergency)

    return DispatchResponse(**dispatch_record)


@router.get(
    "",
    response_model=List[DispatchResponse],
)
def list_dispatches():
    return [
        DispatchResponse(**dispatch)
        for dispatch in DISPATCH_STORE.values()
    ]


@router.get(
    "/{dispatch_id}",
    response_model=DispatchResponse,
)
def get_dispatch(dispatch_id: str):
    if dispatch_id not in DISPATCH_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch '{dispatch_id}' not found",
        )

    return DispatchResponse(
        **DISPATCH_STORE[dispatch_id]
    )


@router.put(
    "/{dispatch_id}/status",
    response_model=DispatchResponse,
)
def update_dispatch_status(
    dispatch_id: str,
    payload: DispatchStatusUpdate,
    db: Any = Depends(get_db),
):
    if dispatch_id not in DISPATCH_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch '{dispatch_id}' not found",
        )

    dispatch_rec = DISPATCH_STORE[dispatch_id]

    dispatch_rec["status"] = payload.status

    if payload.notes:
        dispatch_rec["notes"] = payload.notes

    # Update emergency status in PostgreSQL
    emergency = db.get(
        EmergencyRequest,
        dispatch_rec["emergency_id"],
    )

    if emergency is not None:
        if payload.status == DispatchStatus.ARRIVED:
            emergency.status = EmergencyStatus.ARRIVED.value

        db.commit()
        db.refresh(emergency)

    return DispatchResponse(**dispatch_rec)