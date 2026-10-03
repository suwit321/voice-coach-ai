from fastapi import APIRouter
from .presets import router as presets_router
from .analyses import router as analyses_router
from .transcriptions import router as transcriptions_router

router = APIRouter(prefix="/api/v1")

router.include_router(presets_router, prefix="/presets", tags=["Presets"])
router.include_router(analyses_router, prefix="/analyses", tags=["Analyses"])
router.include_router(transcriptions_router, prefix="/transcriptions", tags=["Transcriptions"])
