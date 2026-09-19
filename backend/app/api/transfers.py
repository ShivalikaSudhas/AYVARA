"""P3 — Inter-hospital patient transfer workflow endpoints."""

from datetime import datetime, timezone
import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.transfer import (
    TransferCreate,
    TransferResponse,
    TransferStatus,
    TransferStatusUpdate
)

router = APIRouter(prefix="/transfers", tags=["Inter-Hospital Transfers"])

TRANSFER_STORE: Dict[str, dict] = {}


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create inter-hospital patient transfer request"
)
def create_transfer_request(payload: TransferCreate):
    """
    Initiates an inter-hospital transfer request when a hospital requires specialized
    care or beds at another facility.
    """
    transfer_id = f"trf_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

    record = {
        "transfer_id": transfer_id,
        "origin_hospital_id": payload.origin_hospital_id,
        "origin_hospital_name": "City General Hospital" if payload.origin_hospital_id == "hosp_001" else "Origin Hospital",
        "destination_hospital_id": payload.destination_hospital_id,
        "destination_hospital_name": "Metropolitan Medical Institute" if payload.destination_hospital_id == "hosp_003" else "Destination Hospital",
        "patient_id": payload.patient_id,
        "reason": payload.reason,
        "department_needed": payload.department_needed,
        "status": TransferStatus.PENDING,
        "response_notes": None,
        "created_at": now,
        "updated_at": now
    }
    TRANSFER_STORE[transfer_id] = record

    return TransferResponse(**record)


@router.get(
    "",
    response_model=List[TransferResponse],
    summary="List inter-hospital transfer requests"
)
def list_transfers(hospital_id: Optional[str] = Query(None, description="Filter transfers by origin or destination hospital ID")):
    """Returns list of transfer requests, optionally filtered by hospital ID."""
    results = list(TRANSFER_STORE.values())
    if hospital_id:
        results = [
            t for t in results
            if t["origin_hospital_id"] == hospital_id or t["destination_hospital_id"] == hospital_id
        ]
    return [TransferResponse(**t) for t in results]


@router.get(
    "/{transfer_id}",
    response_model=TransferResponse,
    summary="Get transfer request details"
)
def get_transfer(transfer_id: str):
    """Retrieves specific inter-hospital transfer request details."""
    if transfer_id not in TRANSFER_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer request '{transfer_id}' not found."
        )
    return TransferResponse(**TRANSFER_STORE[transfer_id])


@router.put(
    "/{transfer_id}/status",
    response_model=TransferResponse,
    summary="Update transfer status (accepted, rejected, in_transit, completed)"
)
def update_transfer_status(transfer_id: str, payload: TransferStatusUpdate):
    """Destination hospital coordinator accepts/rejects transfer or updates transit progress."""
    if transfer_id not in TRANSFER_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer request '{transfer_id}' not found."
        )

    rec = TRANSFER_STORE[transfer_id]
    rec["status"] = payload.status
    rec["updated_at"] = datetime.now(timezone.utc)
    if payload.response_notes:
        rec["response_notes"] = payload.response_notes

    return TransferResponse(**rec)
