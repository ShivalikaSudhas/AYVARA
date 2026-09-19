from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel


class TransferStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TransferCreate(BaseModel):
    origin_hospital_id: str
    destination_hospital_id: str
    patient_id: str
    reason: str
    department_needed: str
    required_specialty: Optional[str] = None


class TransferResponse(BaseModel):
    transfer_id: str
    origin_hospital_id: str
    origin_hospital_name: str
    destination_hospital_id: str
    destination_hospital_name: str
    patient_id: str
    reason: str
    department_needed: str
    status: TransferStatus = TransferStatus.PENDING
    response_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TransferStatusUpdate(BaseModel):
    status: TransferStatus
    response_notes: Optional[str] = None
