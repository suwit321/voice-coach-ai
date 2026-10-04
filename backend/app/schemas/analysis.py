from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .llm_response import LLMFeedbackResponse

class AnalysisCreate(BaseModel):
    preset: str
    transcript: Optional[str] = None
    language: str = "th"

class FillerWordCount(BaseModel):
    word: str
    count: int

class AudioMetrics(BaseModel):
    duration_sec: float
    wpm: float
    filler_count: int
    filler_words: List[FillerWordCount]
    pause_count: int
    avg_pause_duration: float
    total_pause_duration: float
    energy_mean: float
    energy_std: float
    pitch_mean: float
    pitch_std: float
    speech_ratio: float

class RadarData(BaseModel):
    labels: List[str]
    values: List[float]

class PresetInfo(BaseModel):
    key: str
    name: str

class AnalysisResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    preset: PresetInfo
    overall_score: Optional[float] = None
    radar: Optional[RadarData] = None
    metrics: Optional[AudioMetrics] = None
    feedback: Optional[LLMFeedbackResponse] = None
    transcript: Optional[str] = None
    audio_url: Optional[str] = None
    word_tokens: Optional[List[Dict[str, Any]]] = None

class AnalysisListItem(BaseModel):
    id: str
    created_at: datetime
    preset_key: str
    preset_name: str
    overall_score: Optional[float] = None
    status: str

class AnalysisListResponse(BaseModel):
    items: List[AnalysisListItem]
    total: int

class AnalysisStatusResponse(BaseModel):
    id: str
    status: str
    error_message: Optional[str] = None
