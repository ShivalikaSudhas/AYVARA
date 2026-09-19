from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel


class DispatchStatus(str, Enum):
    EN_ROUTE = "en_route"
    ARRIVED = "arrived"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DispatchCreate(BaseModel):
    emergency_id: str
    selected_hospital_id: str
    ambulance_unit: str
    notes: Optional[str] = None


class DispatchResponse(BaseModel):
    dispatch_id: str
    emergency_id: str
    selected_hospital_id: str
    hospital_name: str
    ambulance_unit: str
    reservation_id: Optional[str] = None
    status: DispatchStatus = DispatchStatus.EN_ROUTE
    dispatched_at: datetime
    estimated_arrival_minutes: int


class DispatchStatusUpdate(BaseModel):
    status: DispatchStatus
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    notes: Optional[str] = None
