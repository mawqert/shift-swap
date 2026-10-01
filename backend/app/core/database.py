from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import app_config

engine = create_engine(
    url=app_config.POSTGRES.url,
    echo=False
)

SessionLocal = sessionmaker(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()