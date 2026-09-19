from sqlalchemy import ForeignKey, Integer, String  # type: ignore[import-not-found]
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore[import-not-found]
from app.database.connection import Base
class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
    )
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    total_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    available_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(30),
        default="available",
        nullable=False,
    )

    department = relationship(
        "Department",
        back_populates="resources",
    )