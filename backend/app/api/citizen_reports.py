import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from app.database.session import get_db
from app.models.citizen_report import CitizenReport
from app.models.emergency_request import EmergencyRequest
from app.api.auth import require_roles, get_current_user

router = APIRouter(tags=["Citizen Reports"])

# Basic in-memory sliding window IP rate limiter (5 requests / minute)
IP_REQUEST_LOGS: Dict[str, List[datetime]] = {}
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECONDS = 60

def check_ip_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    
    # Filter logs
    timestamps = [t for t in IP_REQUEST_LOGS.get(client_ip, []) if t > cutoff]
    if len(timestamps) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many emergency reports submitted from this IP address. Please wait a minute.",
        )
    timestamps.append(now)
    IP_REQUEST_LOGS[client_ip] = timestamps

class CitizenReportCreate(BaseModel):
    reporter_phone: Optional[str] = Field(default=None, max_length=30)
    description: str = Field(min_length=3, max_length=255)
    latitude: float
    longitude: float

class CitizenReportResponse(BaseModel):
    id: str
    reporter_phone: Optional[str] = None
    description: str
    latitude: float
    longitude: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/citizen-report", response_model=CitizenReportResponse, status_code=status.HTTP_201_CREATED)
def submit_citizen_report(
    payload: CitizenReportCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    check_ip_rate_limit(request)
    
    report_id = f"CR-{uuid.uuid4().hex[:6].upper()}"
    report = CitizenReport(
        id=report_id,
        reporter_phone=payload.reporter_phone,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status="PENDING",
        created_at=datetime.utcnow()
    )
    
    if db:
        try:
            db.add(report)
            db.commit()
            db.refresh(report)
        except Exception:
            db.rollback()
            
    return CitizenReportResponse(
        id=report.id,
        reporter_phone=report.reporter_phone,
        description=report.description,
        latitude=report.latitude,
        longitude=report.longitude,
        status=report.status,
        created_at=report.created_at or datetime.utcnow()
    )

@router.get("/citizen-reports", response_model=List[CitizenReportResponse])
def list_citizen_reports(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(["admin", "dispatcher"]))
):
    if not db:
        return []
    query = db.query(CitizenReport)
    if status_filter:
        query = query.filter(CitizenReport.status == status_filter.upper())
    return query.order_by(CitizenReport.created_at.desc()).all()

@router.post("/citizen-reports/{report_id}/confirm", status_code=status.HTTP_200_OK)
def confirm_citizen_report(
    report_id: str,
    priority: str = "critical",
    required_specialty: str = "icu",
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(["admin", "dispatcher"]))
):
    if not db:
        return {"status": "CONFIRMED", "message": f"Report {report_id} confirmed (mock)"}
        
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Citizen report not found")
        
    report.status = "CONFIRMED"
    
    # Create real emergency_request
    emergency_id = f"ER-{uuid.uuid4().hex[:6].upper()}"
    emergency = EmergencyRequest(
        id=emergency_id,
        patient_condition=f"Confirmed Public Report: {report.description}",
        latitude=report.latitude,
        longitude=report.longitude,
        status="MATCHING",
        created_at=datetime.utcnow()
    )
    db.add(emergency)
    db.commit()
    
    return {
        "status": "CONFIRMED",
        "report_id": report.id,
        "created_emergency_id": emergency.id,
        "message": f"Citizen report {report.id} confirmed and converted into Emergency Request {emergency.id}."
    }
