"""P3 — Dispatch Pydantic schema definitions."""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class DispatchStatus(str, Enum):
    EN_ROUTE = "en_route"
    ARRIVED = "arrived"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DispatchCreate(BaseModel):
    emergency_id: str = Field(..., example="emg_5541")
    selected_hospital_id: str = Field(..., example="hosp_001")
    ambulance_unit: str = Field(..., example="AMB-04")
    notes: Optional[str] = Field(None, example="Patient stable, oxygen administered")


class DispatchResponse(BaseModel):
    dispatch_id: str = Field(..., example="dsp_1029")
    emergency_id: str = Field(..., example="emg_5541")
    selected_hospital_id: str = Field(..., example="hosp_001")
    hospital_name: str = Field(..., example="City General Hospital")
    ambulance_unit: str = Field(..., example="AMB-04")
    reservation_id: Optional[str] = Field(None, example="res_8871")
    status: DispatchStatus = DispatchStatus.EN_ROUTE
    dispatched_at: datetime
    estimated_arrival_minutes: int = Field(..., example=8)


class DispatchStatusUpdate(BaseModel):
    status: DispatchStatus
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    notes: Optional[str] = None
