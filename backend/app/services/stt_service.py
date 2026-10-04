import logging

logger = logging.getLogger(__name__)

def transcribe_with_gemini(audio_path: str, api_key: str, language: str = "th") -> dict:
    """Transcribe audio using Google Gemini multimodal audio capability (Free & Fast)."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        # Upload audio file to Gemini File API
        uploaded_file = genai.upload_file(path=audio_path)
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            "กรุณาถอดเสียงภาษาไทยจากไฟล์เสียงนี้อย่างละเอียดและตรงตามคำพูดจริงทุกคำ (Verbatim Transcription) "
            "โดยให้เก็บคำฟุ่มเฟือย/คำติดปากทุกคำ เช่น 'เอ่อ', 'อ่า', 'แบบว่า', 'คือว่า', 'นะค่ะ' ไว้ครบถ้วน "
            "ตอบเฉพาะข้อความที่ถอดเสียงได้เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติมใดๆ ทั้งสิ้น"
        )
        response = model.generate_content([uploaded_file, prompt])
        transcript_text = (response.text or "").strip()
        
        # Cleanup file from Gemini
        try:
            genai.delete_file(uploaded_file.name)
        except Exception:
            pass
            
        return {
            'text': transcript_text,
            'language': language,
            'segments': []
        }
    except Exception as e:
        logger.error(f"Gemini Audio STT Error: {e}")
        raise e

def transcribe_audio(audio_path: str, language: str = "th", api_key: str = "", provider: str = "openai") -> dict:
    """Transcribe audio using either OpenAI Whisper or Google Gemini based on key/provider."""
    # Auto-detect if key is Google Gemini key (starts with AIza...)
    if api_key.startswith("AIza") or provider == "gemini":
        return transcribe_with_gemini(audio_path, api_key=api_key, language=language)

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
        # If OpenAI fails or key is invalid, and another key exists, bubble up
        raise e
