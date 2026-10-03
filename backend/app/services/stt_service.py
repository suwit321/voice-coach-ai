import logging

logger = logging.getLogger(__name__)

def transcribe_audio(audio_path: str, language: str = "th", api_key: str = "") -> dict:
    """Transcribe audio using Whisper API with filler word retention.
    
    Args:
        audio_path: Path to the audio file
        language: Language code
        api_key: OpenAI API Key
        
    Returns:
        dict: Transcription results
    """
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        with open(audio_path, 'rb') as f:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language=language,
                # IMPORTANT: Prompt priming to retain filler words
                prompt="เอ่อ... อ่า... แบบว่า คือว่า เรากำลังพูดถึงเรื่อง...",
                response_format="verbose_json",
                temperature=0.0,
            )
        
        return {
            'text': transcription.text,
            'duration': getattr(transcription, 'duration', None),
            'language': language,
        }
    except Exception as e:
        logger.error(f"STT Error: {e}")
        raise e
