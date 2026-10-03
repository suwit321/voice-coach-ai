from fastapi import APIRouter
from ..schemas.preset import PresetListResponse
from ..presets import get_all_presets

router = APIRouter()

@router.get("", response_model=PresetListResponse)
def get_presets():
    """Returns all enabled presets."""
    presets = get_all_presets()
    return PresetListResponse(presets=presets)
