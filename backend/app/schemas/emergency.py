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
    patient_condition: str
    severity: SeverityLevel
    latitude: float
    longitude: float
    required_specialties: List[str] = Field(default_factory=list)
    blood_type_needed: Optional[str] = None


class HospitalMatchResult(BaseModel):
    hospital_id: str
    hospital_name: str
    latitude: float
    longitude: float
    match_score: float
    distance_km: float
    estimated_eta_minutes: int
    available_icu_beds: int
    total_available_beds: int
    matched_specialties: List[str] = Field(default_factory=list)
    has_blood_stock: bool = True


class EmergencyMatchResponse(BaseModel):
    emergency_id: str
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
