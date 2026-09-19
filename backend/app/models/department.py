from sqlalchemy import ForeignKey, String  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Mapped, mapped_column, relationship  # pyright: ignore[reportMissingImports]
from app.database.connection import Base
class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    hospital_id: Mapped[str] = mapped_column(
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(
        String(30),
        default="operational",
        nullable=False,
    )

    hospital = relationship(
        "Hospital",
        back_populates="departments",
    )

    resources = relationship(
        "Resource",
        back_populates="department",
        cascade="all, delete-orphan",
    )