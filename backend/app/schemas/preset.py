from pydantic import BaseModel
from typing import List, Optional

class DimensionConfig(BaseModel):
    key: str
    label: str
    weight: float

class PresetConfig(BaseModel):
    key: str
    name: str
    icon: str
    goal: str
    description: str
    dimensions: List[DimensionConfig]
    target_wpm_min: int
    target_wpm_max: int
    checklist: List[str]
    filler_words: List[str]
    enabled: bool = True

class PresetListResponse(BaseModel):
    presets: List[PresetConfig]
