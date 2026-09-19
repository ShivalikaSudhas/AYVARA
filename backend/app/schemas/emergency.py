"""P3 — Emergency Pydantic schema definitions."""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class EmergencyStatus(str, Enum):
    PENDING = "pending"
    MATCHED = "matched"
    DISPATCHED = "dispatched"
    ARRIVED = "arrived"
    CANCELLED = "cancelled"


class EmergencyCreate(BaseModel):
    patient_condition: str = Field(..., example="Severe Cardiac Arrest")
    severity: SeverityLevel = Field(..., example=SeverityLevel.CRITICAL)
    latitude: float = Field(..., example=40.7306)
    longitude: float = Field(..., example=-73.9352)
    required_specialties: List[str] = Field(default_factory=list, example=["cardiology", "icu"])
    blood_type_needed: Optional[str] = Field(None, example="O_negative")


class HospitalMatchResult(BaseModel):
    hospital_id: str = Field(..., example="hosp_001")
    hospital_name: str = Field(..., example="City General Hospital")
    latitude: float = Field(..., example=40.7128)
    longitude: float = Field(..., example=-74.0060)
    match_score: float = Field(..., example=95.4, description="Calculated score from 0 to 100")
    distance_km: float = Field(..., example=3.2)
    estimated_eta_minutes: int = Field(..., example=8)
    available_icu_beds: int = Field(..., example=3)
    total_available_beds: int = Field(..., example=14)
    matched_specialties: List[str] = Field(default_factory=list)
    has_blood_stock: bool = Field(default=True)


class EmergencyMatchResponse(BaseModel):
    emergency_id: str = Field(..., example="emg_5541")
    patient_condition: str
    severity: SeverityLevel
    status: EmergencyStatus = EmergencyStatus.MATCHED
    created_at: datetime
    matches: List[HospitalMatchResult]


class EmergencyDetailResponse(BaseModel):
    id: str
    patient_condition: str
    severity: SeverityLevel
    status: EmergencyStatus
    latitude: float
    longitude: float
    required_specialties: List[str]
    blood_type_needed: Optional[str] = None
    selected_hospital_id: Optional[str] = None
    created_at: datetime
