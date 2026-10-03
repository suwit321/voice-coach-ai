from typing import Dict
from .base import to_schema
from .meeting import MEETING_PRESET
from .public_speaking import PUBLIC_SPEAKING_PRESET
from .mc import MC_PRESET

PRESETS: Dict[str, dict] = {
    "meeting": MEETING_PRESET,
    "public_speaking": PUBLIC_SPEAKING_PRESET,
    "mc": MC_PRESET
}

def get_preset(key: str):
    return PRESETS.get(key)

def get_all_presets():
    return [to_schema(preset) for preset in PRESETS.values() if preset.get("enabled", True)]
