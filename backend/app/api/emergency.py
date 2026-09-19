from datetime import datetime, timezone
import json
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.session import get_db
from app.models.emergency_request import EmergencyRequest
from app.schemas.emergency import (
    EmergencyCreate,
    EmergencyDetailResponse,
    EmergencyMatchResponse,
    EmergencyStatus,
)
from app.services.matching import find_matching_hospitals


router = APIRouter(
    prefix="/emergency",
    tags=["Emergency"],
)


@router.post(
    "",
    response_model=EmergencyMatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_emergency_request(
    payload: EmergencyCreate,
    db: Any = Depends(get_db),
):
    emergency_id = f"emg_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

    # P3 matching engine
    matches = find_matching_hospitals(payload)

    # Store emergency request in PostgreSQL
    emergency = EmergencyRequest(
        id=emergency_id,
        patient_condition=payload.patient_condition,
        severity=payload.severity.value,
        status=EmergencyStatus.MATCHED.value,
        latitude=payload.latitude,
        longitude=payload.longitude,
        required_specialties=json.dumps(
            payload.required_specialties
        ),
        blood_type_needed=payload.blood_type_needed,
        selected_hospital_id=None,
        created_at=now,
    )

    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    return EmergencyMatchResponse(
        emergency_id=emergency.id,
        patient_condition=emergency.patient_condition,
        severity=payload.severity,
        status=EmergencyStatus.MATCHED,
        created_at=emergency.created_at,
        matches=matches,
    )


@router.get(
    "",
    response_model=list[EmergencyDetailResponse],
)
def list_emergencies(
    db: Any = Depends(get_db),
):
    emergencies = db.query(EmergencyRequest).order_by(
        EmergencyRequest.created_at.desc()
    ).all()

    return [
        EmergencyDetailResponse(
            id=emergency.id,
            patient_condition=emergency.patient_condition,
            severity=emergency.severity,
            status=EmergencyStatus(emergency.status),
            latitude=emergency.latitude,
            longitude=emergency.longitude,
            required_specialties=json.loads(
                emergency.required_specialties or "[]"
            ),
            blood_type_needed=emergency.blood_type_needed,
            selected_hospital_id=emergency.selected_hospital_id,
            created_at=emergency.created_at,
        )
        for emergency in emergencies
    ]


@router.get(
    "/{emergency_id}",
    response_model=EmergencyDetailResponse,
)
def get_emergency(
    emergency_id: str,
    db: Any = Depends(get_db),
):
    emergency = db.get(
        EmergencyRequest,
        emergency_id,
    )

    if emergency is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency '{emergency_id}' not found",
        )

    return EmergencyDetailResponse(
        id=emergency.id,
        patient_condition=emergency.patient_condition,
        severity=emergency.severity,
        status=EmergencyStatus(emergency.status),
        latitude=emergency.latitude,
        longitude=emergency.longitude,
        required_specialties=json.loads(
            emergency.required_specialties or "[]"
        ),
        blood_type_needed=emergency.blood_type_needed,
        selected_hospital_id=emergency.selected_hospital_id,
        created_at=emergency.created_at,
    )