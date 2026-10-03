import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, JSON, Integer, Text, DateTime
from ..database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    preset_key = Column(String, nullable=False)
    language = Column(String, default="th")
    transcript = Column(Text, nullable=True)
    audio_filename = Column(String, nullable=True)
    duration_sec = Column(Float, nullable=True)
    audio_metrics = Column(JSON, nullable=True)
    content_metrics = Column(JSON, nullable=True)
    dimension_scores = Column(JSON, nullable=True)
    overall_score = Column(Float, nullable=True)
    llm_feedback = Column(JSON, nullable=True)
    model_metadata = Column(JSON, nullable=True)
    status = Column(String, default="queued")
    error_message = Column(String, nullable=True)
    feedback_rating = Column(Integer, nullable=True)
