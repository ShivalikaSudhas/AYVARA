from sqlalchemy import String, ForeignKey  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Mapped, mapped_column, relationship  # pyright: ignore[reportMissingImports]
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # admin, coordinator, dispatcher
    hospital_id: Mapped[str | None] = mapped_column(
        ForeignKey("hospitals.id", ondelete="SET NULL"),
        nullable=True
    )

    hospital = relationship("Hospital")
