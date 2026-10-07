import os
import json
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "agrivision.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=get_utc_now, index=True)
    crop = Column(String(100), nullable=False)
    crop_hi = Column(String(100), nullable=True)
    disease_name = Column(String(150), nullable=False)
    disease_name_hi = Column(String(150), nullable=True)
    class_name = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False)
    is_healthy = Column(Boolean, default=False)
    top3_json = Column(Text, nullable=True)
    image_thumbnail = Column(Text, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
