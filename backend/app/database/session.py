from sqlalchemy.orm import Session, sessionmaker  # pyright: ignore[reportMissingImports]
from app.database.connection import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()