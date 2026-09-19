"""P3 — Emergency request handling endpoints."""

from datetime import datetime, timezone
import uuid
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status
from app.schemas.emergency import (
    EmergencyCreate,
    EmergencyDetailResponse,
    EmergencyMatchResponse,
    EmergencyStatus
)
from app.services.matching import find_matching_hospitals

router = APIRouter(prefix="/emergency", tags=["Emergency & Matching"])

# In-memory emergency database for fast prototyping & demo
EMERGENCY_STORE: Dict[str, dict] = {}


@router.post(
    "",
    response_model=EmergencyMatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit emergency request & get ranked hospital matches"
)
def create_emergency_request(payload: EmergencyCreate):
    """
    Receives incoming emergency patient condition, location (lat/lon), required specialties,
    and blood type. Runs the matching algorithm to return a ranked list of available hospitals.
    """
    emergency_id = f"emg_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

    # 1. Execute matching engine algorithm
    matches = find_matching_hospitals(payload)

    # 2. Store emergency record
    emergency_record = {
        "id": emergency_id,
        "patient_condition": payload.patient_condition,
        "severity": payload.severity,
        "status": EmergencyStatus.MATCHED,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "required_specialties": payload.required_specialties,
        "blood_type_needed": payload.blood_type_needed,
        "selected_hospital_id": None,
        "created_at": now,
        "matches": [m.model_dump() for m in matches]
    }
    EMERGENCY_STORE[emergency_id] = emergency_record

    return EmergencyMatchResponse(
        emergency_id=emergency_id,
        patient_condition=payload.patient_condition,
        severity=payload.severity,
        status=EmergencyStatus.MATCHED,
        created_at=now,
        matches=matches
    )


@router.get(
    "",
    response_model=List[EmergencyDetailResponse],
    summary="List all active emergency incidents"
)
def list_emergencies():
    """Returns a list of all active emergency requests in the system."""
    return [
        EmergencyDetailResponse(
            id=rec["id"],
            patient_condition=rec["patient_condition"],
            severity=rec["severity"],
            status=rec["status"],
            latitude=rec["latitude"],
            longitude=rec["longitude"],
            required_specialties=rec["required_specialties"],
            blood_type_needed=rec.get("blood_type_needed"),
            selected_hospital_id=rec.get("selected_hospital_id"),
            created_at=rec["created_at"]
        )
        for rec in EMERGENCY_STORE.values()
    ]


@router.get(
    "/{emergency_id}",
    response_model=EmergencyDetailResponse,
    summary="Get emergency details by ID"
)
def get_emergency(emergency_id: str):
    """Retrieves specific emergency incident details by ID."""
    if emergency_id not in EMERGENCY_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency request '{emergency_id}' not found."
        )
    rec = EMERGENCY_STORE[emergency_id]
    return EmergencyDetailResponse(
        id=rec["id"],
        patient_condition=rec["patient_condition"],
        severity=rec["severity"],
        status=rec["status"],
        latitude=rec["latitude"],
        longitude=rec["longitude"],
        required_specialties=rec["required_specialties"],
        blood_type_needed=rec.get("blood_type_needed"),
        selected_hospital_id=rec.get("selected_hospital_id"),
        created_at=rec["created_at"]
    )
