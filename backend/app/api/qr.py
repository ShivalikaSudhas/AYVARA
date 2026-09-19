"""P4 — QR handover generation and verification endpoints.

POST /api/v1/qr/generate  — generate a signed QR token for a reservation
POST /api/v1/qr/verify    — verify a QR token and return reservation data
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.services.qr_service import generate_qr_token, verify_qr_token

router = APIRouter(prefix="/qr", tags=["QR Handover (P4)"])


# ---------------------------------------------------------------------------
# Request / response schemas (inline — QR is P4-owned)
# ---------------------------------------------------------------------------

class QRGenerateRequest(BaseModel):
    reservation_id: str
    patient_id: str
    hospital_id: str
    bed_number: str


class QRGenerateResponse(BaseModel):
    token: str
    qr_image: Optional[str] = None
    """data:image/png;base64,... ready for <img src>"""
    reservation_id: str
    patient_id: str
    hospital_id: str
    bed_number: str
    issued_at: str


class QRVerifyRequest(BaseModel):
    qr_code_payload: str
    """The full token string from the QR code."""


class QRVerifyResponse(BaseModel):
    verified: bool
    reservation_id: Optional[str] = None
    patient_id: Optional[str] = None
    hospital_id: Optional[str] = None
    bed_number: Optional[str] = None
    issued_at: Optional[str] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/generate",
    response_model=QRGenerateResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_qr(payload: QRGenerateRequest):
    """Generate a signed QR token for a reservation handover."""
    result = generate_qr_token(
        reservation_id=payload.reservation_id,
        patient_id=payload.patient_id,
        hospital_id=payload.hospital_id,
        bed_number=payload.bed_number,
    )
    return QRGenerateResponse(**result)


@router.post("/verify", response_model=QRVerifyResponse)
def verify_qr(payload: QRVerifyRequest):
    """Verify a QR token. Returns verified=False with error on failure."""
    result = verify_qr_token(payload.qr_code_payload)
    if not result["verified"]:
        # Still 200 — let caller decide how to handle
        return QRVerifyResponse(**result)
    return QRVerifyResponse(**result)
