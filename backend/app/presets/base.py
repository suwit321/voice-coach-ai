from typing import TypedDict, List
from ..schemas.preset import PresetConfig, DimensionConfig

class DimensionDict(TypedDict):
    key: str
    label: str
    weight: float

class PresetDict(TypedDict):
    key: str
    name: str
    icon: str
    goal: str
    description: str
    dimensions: List[DimensionDict]
    target_wpm: tuple[int, int]
    checklist: List[str]
    filler_words: List[str]
    enabled: bool

def to_schema(preset: PresetDict) -> PresetConfig:
    dimensions = [DimensionConfig(**d) for d in preset["dimensions"]]
    return PresetConfig(
        key=preset["key"],
        name=preset["name"],
        icon=preset["icon"],
        goal=preset["goal"],
        description=preset["description"],
        dimensions=dimensions,
        target_wpm_min=preset["target_wpm"][0],
        target_wpm_max=preset["target_wpm"][1],
        checklist=preset["checklist"],
        filler_words=preset["filler_words"],
        enabled=preset.get("enabled", True)
    )
