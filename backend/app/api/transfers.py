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

router = APIRouter(prefix="/transfers", tags=["Transfers"])

TRANSFER_STORE: Dict[str, dict] = {}


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer_request(payload: TransferCreate):
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


@router.get("", response_model=List[TransferResponse])
def list_transfers(hospital_id: Optional[str] = Query(None)):
    results = list(TRANSFER_STORE.values())
    if hospital_id:
        results = [
            t for t in results
            if t["origin_hospital_id"] == hospital_id or t["destination_hospital_id"] == hospital_id
        ]
    return [TransferResponse(**t) for t in results]


@router.get("/{transfer_id}", response_model=TransferResponse)
def get_transfer(transfer_id: str):
    if transfer_id not in TRANSFER_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer '{transfer_id}' not found"
        )
    return TransferResponse(**TRANSFER_STORE[transfer_id])


@router.put("/{transfer_id}/status", response_model=TransferResponse)
def update_transfer_status(transfer_id: str, payload: TransferStatusUpdate):
    if transfer_id not in TRANSFER_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer '{transfer_id}' not found"
        )

    rec = TRANSFER_STORE[transfer_id]
    rec["status"] = payload.status
    rec["updated_at"] = datetime.now(timezone.utc)
    if payload.response_notes:
        rec["response_notes"] = payload.response_notes

    return TransferResponse(**rec)
