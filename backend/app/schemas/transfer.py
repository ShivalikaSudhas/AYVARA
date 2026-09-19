"""P3 — Inter-Hospital Transfer Pydantic schema definitions."""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TransferStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TransferCreate(BaseModel):
    origin_hospital_id: str = Field(..., example="hosp_001")
    destination_hospital_id: str = Field(..., example="hosp_002")
    patient_id: str = Field(..., example="pat_9982")
    reason: str = Field(..., example="Requires specialized neurosurgery ICU bed")
    department_needed: str = Field(..., example="Neurosurgery ICU")
    required_specialty: Optional[str] = Field(None, example="neurosurgery")


class TransferResponse(BaseModel):
    transfer_id: str = Field(..., example="trf_3041")
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
    response_notes: Optional[str] = Field(None, example="Accepted - Bed ICU-02 reserved for transfer patient")
