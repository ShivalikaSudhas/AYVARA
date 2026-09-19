from sqlalchemy.orm import Session  # type: ignore[import-not-found]
from app.database.connection import engine
def get_db():
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()