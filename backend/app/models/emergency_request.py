from datetime import datetime
from sqlalchemy import Float, ForeignKey, String, Text  # type: ignore[import-not-found]
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore[import-not-found]
from app.database.connection import Base

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)

    patient_condition: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    required_specialties: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    blood_type_needed: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False,
    )

    selected_hospital_id: Mapped[str | None] = mapped_column(
        ForeignKey("hospitals.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False,
    )

    selected_hospital = relationship("Hospital")