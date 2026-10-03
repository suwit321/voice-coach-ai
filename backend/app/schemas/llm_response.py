from pydantic import BaseModel
from typing import List, Literal, Optional

class DimensionScore(BaseModel):
    key: str
    label: str
    score: float
    reason: str

class Priority(BaseModel):
    title: str
    evidence: str
    impact: Literal["high", "medium", "low"]
    recommendation: str
    exercise: str

class ContentRewrite(BaseModel):
    original: str
    improved: str
    reason: str

class ContentCoherenceAnalysis(BaseModel):
    clarity_level: str  # เช่น "ฟังเข้าใจง่าย ชัดเจน ตรงประเด็น"
    structure_flow: str  # เช่น "มีการลำดับเป็นขั้นตอนชัดเจน มีการเกริ่นนำ-เนื้อหา-สรุป"
    circular_analysis: str  # เช่น "ไม่พบการพูดวกวน เนื้อหาต่อเนื่องกระชับ"
    coherence_score: float  # 0 - 100
    details: List[str]  # รายละเอียดข้อสังเกตเพิ่มเติม

class LLMFeedbackResponse(BaseModel):
    overall_score: float
    dimension_scores: List[DimensionScore]
    strengths: List[str]
    priorities: List[Priority]
    content_rewrites: List[ContentRewrite]
    practice_plan: List[str]
    limitations: List[str]
    content_coherence: Optional[ContentCoherenceAnalysis] = None
