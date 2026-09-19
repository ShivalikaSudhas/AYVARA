from sqlalchemy import create_engine  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase  # pyright: ignore[reportMissingImports]
from app.config import settings
class Base(DeclarativeBase):
    pass
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)