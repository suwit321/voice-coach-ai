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
        
        # Extract detailed speech segments with timestamps and rhythm
        raw_segments = getattr(transcription, 'segments', None) or []
        segments = []
        for s in raw_segments:
            s_dict = s if isinstance(s, dict) else s.__dict__
            start = float(s_dict.get('start', 0.0))
            end = float(s_dict.get('end', 0.0))
            seg_text = (s_dict.get('text') or '').strip()
            duration = max(0.1, end - start)
            
            # Approximate syllable / word speed in segment
            word_count = len(seg_text.split()) if seg_text else 1
            wpm_est = round((word_count / (duration / 60)), 1)
            
            # Rhythm pace indicator
            pace = "จังหวะปกติ"
            if wpm_est > 160:
                pace = "จังหวะเร็ว/เร่งรีบ"
            elif wpm_est < 90:
                pace = "จังหวะช้า/เน้นเสียง"

            segments.append({
                'id': s_dict.get('id', len(segments)),
                'start': round(start, 2),
                'end': round(end, 2),
                'duration': round(duration, 2),
                'text': seg_text,
                'wpm': wpm_est,
                'pace': pace
            })

        return {
            'text': transcription.text,
            'duration': getattr(transcription, 'duration', None),
            'language': language,
            'segments': segments
        }
    except Exception as e:
        logger.error(f"STT Error: {e}")
        raise e
