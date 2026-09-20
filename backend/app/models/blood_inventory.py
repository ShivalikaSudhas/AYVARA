from sqlalchemy import ForeignKey, Integer, String  # type: ignore[import-not-found]
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore[import-not-found]
from app.database.connection import Base
class BloodInventory(Base):
    __tablename__ = "blood_inventory"
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    hospital_id: Mapped[str] = mapped_column(
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
    )
    blood_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    available_units: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    minimum_units: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    hospital = relationship("Hospital")