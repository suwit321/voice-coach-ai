import os
import uuid
import shutil
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from ..config import settings
from ..services.stt_service import transcribe_audio as whisper_transcribe
from ..utils.audio_utils import convert_to_wav

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("")
async def transcribe_audio_endpoint(
    audio_file: UploadFile = File(...),
    x_stt_api_key: Optional[str] = Header(None),
    x_llm_api_key: Optional[str] = Header(None)
):
    """Accepts an audio file and returns transcript text using Whisper STT."""
    stt_key = x_stt_api_key or x_llm_api_key or settings.STT_API_KEY or settings.LLM_API_KEY
    if not stt_key:
        raise HTTPException(
            status_code=400,
            detail="STT API key is not configured. Please set in Settings tab or backend .env"
        )


    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(audio_file.filename)[1] or ".webm"
    temp_path = os.path.join(settings.UPLOAD_DIR, f"temp_stt_{uuid.uuid4()}{file_ext}")
    converted_path = None

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        # Convert to WAV if needed for Whisper stability
        work_path = temp_path
        if not temp_path.lower().endswith(".wav"):
            converted_path = temp_path + ".wav"
            try:
                convert_to_wav(temp_path, converted_path)
                work_path = converted_path
            except Exception as conv_err:
                logger.warning(f"Audio conversion failed: {conv_err}; attempting direct audio file")
                work_path = temp_path

        result = whisper_transcribe(work_path, language="th", api_key=stt_key)
        return {
            "transcript": result.get("text", ""),
            "duration": result.get("duration"),
            "language": "th"
        }
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        for p in [temp_path, converted_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
