from sqlalchemy import ForeignKey, String  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Mapped, mapped_column, relationship  # pyright: ignore[reportMissingImports]
from app.database.connection import Base

class Bed(Base):
    __tablename__ = "beds"
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
    )
    bed_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    bed_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(30),
        default="available",
        nullable=False,
    )
    department = relationship("Department")