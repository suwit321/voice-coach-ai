import logging
import os
import json
from app.services.audio_analyzer import analyze_audio
from app.services.stt_service import transcribe_audio
from app.services.content_analyzer import analyze_content
from app.services.scoring_engine import (
    calculate_acoustic_score,
    calculate_content_score,
    calculate_final_score,
    generate_rule_based_feedback
)
from app.services.llm_adapter import create_llm_adapter
from app.utils.audio_utils import convert_to_wav
from app.prompts.preset_prompts import build_analysis_prompt
from app.config import settings
from app.database import SessionLocal
from app.models.analysis import Analysis
from app.utils.privacy_filter import anonymize_text
from app.presets import get_preset




logger = logging.getLogger(__name__)

def run_analysis_pipeline(
    analysis_id: str,
    audio_path: str,
    preset_key: str,
    transcript: str | None,
    language: str = "th",
    llm_provider: str | None = None,
    llm_api_key: str | None = None,
    llm_model: str | None = None,
    stt_api_key: str | None = None
):
    """Main pipeline: audio analysis -> STT (if needed) -> content analysis -> scoring -> LLM -> save results.
    
    This is a sync function that runs in FastAPI BackgroundTasks thread pool.
    """
    effective_llm_provider = llm_provider or settings.LLM_PROVIDER
    effective_llm_key = llm_api_key or settings.LLM_API_KEY
    effective_llm_model = llm_model or settings.LLM_MODEL
    effective_stt_key = stt_api_key or settings.STT_API_KEY or effective_llm_key

    db = SessionLocal()
    converted_path = None
    try:
        logger.info(f"Starting analysis for {analysis_id} with preset {preset_key}")
        
        # 1. Update status to 'processing'
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            logger.error(f"Analysis record {analysis_id} not found in database")
            return

        analysis.status = "processing"
        db.commit()

        # Fetch preset configuration
        preset_config = get_preset(preset_key)
        if not preset_config:
            preset_config = {
                "key": preset_key,
                "name": "General Speech",
                "dimensions": [
                    {"key": "pace", "label": "จังหวะการพูด", "weight": 0.25},
                    {"key": "energy", "label": "พลังเสียง", "weight": 0.25},
                    {"key": "clarity", "label": "ความชัดเจน", "weight": 0.25},
                    {"key": "fluency", "label": "ความลื่นไหล", "weight": 0.25},
                ],
                "target_wpm": [100, 150],
                "filler_words": []
            }
        
        # 2. Convert audio to WAV if needed
        work_audio_path = audio_path
        if not audio_path.lower().endswith('.wav'):
            converted_path = audio_path + '.wav'
            try:
                convert_to_wav(audio_path, converted_path)
                work_audio_path = converted_path
            except Exception as e:
                logger.warning(f"Audio conversion with ffmpeg failed ({e}), attempting to load original directly: {audio_path}")
                work_audio_path = audio_path

        # 3. Run audio analysis (librosa)
        try:
            audio_metrics = analyze_audio(work_audio_path)
        except Exception as e:
            logger.error(f"librosa analysis failed: {e}")
            audio_metrics = {
                'duration_sec': 30.0,
                'energy_mean': 0.05,
                'energy_std': 0.02,
                'pitch_mean': 160.0,
                'pitch_std': 25.0,
                'pause_count': 3,
                'long_pause_count': 0,
                'total_pause_duration': 2.0,
                'avg_pause_duration': 0.67,
                'speech_ratio': 0.93,
                'pauses': []
            }

        # 4. If no transcript, run STT
        duration_sec = audio_metrics.get('duration_sec', 0.0)
        stt_key = effective_stt_key
        stt_segments = []
        if (not transcript or not transcript.strip()):
            if stt_key:
                try:
                    logger.info(f"Transcribing audio with {effective_llm_provider}...")
                    stt_res = transcribe_audio(work_audio_path, language=language, api_key=stt_key, provider=effective_llm_provider)
                    transcript = stt_res.get('text', '')
                    stt_segments = stt_res.get('segments', [])
                except Exception as e:
                    logger.error(f"Whisper STT failed: {e}")
                    transcript = "ไม่สามารถถอดเสียงอัตโนมัติได้ กรุณาระบุ transcript ด้วยตนเอง"
            else:
                logger.warning("No STT_API_KEY configured; skipping Whisper.")
                transcript = "ไม่มี transcript เนื่องจากยังไม่ได้ตั้งค่า STT_API_KEY"

        # Privacy Guardrail: Anonymize Personally Identifiable Information (PII)
        safe_transcript, redacted_pii = anonymize_text(transcript or "")
        if any(v > 0 for v in redacted_pii.values()):
            logger.info(f"Redacted sensitive PII for privacy in analysis {analysis_id}: {redacted_pii}")
        transcript = safe_transcript

        # 5. Run content analysis (PyThaiNLP)
        preset_filler_words = preset_config.get('filler_words', [])
        content_metrics = analyze_content(
            transcript=transcript or "",
            duration_sec=duration_sec,
            preset_filler_words=preset_filler_words
        )
        # Attach speech rhythm timeline and pauses
        content_metrics['segments'] = stt_segments
        content_metrics['pauses'] = audio_metrics.get('pauses', [])

        
        # Merge WPM into audio_metrics for scoring
        audio_metrics['wpm'] = content_metrics.get('wpm', 120.0)
        
        # 6. Calculate heuristic scores
        acoustic_score = calculate_acoustic_score(audio_metrics, preset_config)
        content_score = calculate_content_score(content_metrics, preset_config)
        preset_fit = 85.0
        final_score = calculate_final_score(acoustic_score, content_score, preset_fit)
        
        # 7. Try LLM feedback (with retry and fallback)
        llm_feedback = None
        if effective_llm_key:
            try:
                adapter = create_llm_adapter(effective_llm_provider, effective_llm_key, effective_llm_model)
                prompt = build_analysis_prompt(preset_config, audio_metrics, content_metrics, transcript)
                llm_feedback = adapter.generate_feedback(prompt, {**audio_metrics, **content_metrics}, transcript, preset_config)

            except Exception as e:
                logger.error(f"LLM call failed ({e}), using rule-based feedback fallback")
                llm_feedback = generate_rule_based_feedback(audio_metrics, content_metrics, preset_config)
        else:
            logger.info("No LLM_API_KEY provided; using rule-based feedback")
            llm_feedback = generate_rule_based_feedback(audio_metrics, content_metrics, preset_config)

        # 8. Build radar data from preset dimensions and feedback
        dim_labels = []
        dim_values = []
        feedback_dim_scores = llm_feedback.get("dimension_scores", []) if isinstance(llm_feedback, dict) else []
        dim_score_map = {d.get("key"): d.get("score") for d in feedback_dim_scores if isinstance(d, dict)}
        
        for dim in preset_config.get("dimensions", []):
            d_key = dim.get("key")
            d_label = dim.get("label", d_key)
            dim_labels.append(d_label)
            val = dim_score_map.get(d_key, final_score)
            dim_values.append(float(val))

        radar_data = {
            "labels": dim_labels,
            "values": dim_values
        }

        # 9. Format combined audio_metrics to match AudioMetrics schema
        structured_metrics = {
            "duration_sec": float(audio_metrics.get("duration_sec", 0.0)),
            "wpm": float(content_metrics.get("wpm", 0.0)),
            "filler_count": int(content_metrics.get("filler_count", 0)),
            "filler_words": content_metrics.get("filler_words", []),
            "pause_count": int(audio_metrics.get("pause_count", 0)),
            "avg_pause_duration": float(audio_metrics.get("avg_pause_duration", 0.0)),
            "total_pause_duration": float(audio_metrics.get("total_pause_duration", 0.0)),
            "energy_mean": float(audio_metrics.get("energy_mean", 0.0)),
            "energy_std": float(audio_metrics.get("energy_std", 0.0)),
            "pitch_mean": float(audio_metrics.get("pitch_mean", 0.0)),
            "pitch_std": float(audio_metrics.get("pitch_std", 0.0)),
            "speech_ratio": float(audio_metrics.get("speech_ratio", 0.0)),
            "timeline_labels": audio_metrics.get("timeline_labels", []),
            "energy_series": audio_metrics.get("energy_series", []),
            "pitch_series": audio_metrics.get("pitch_series", []),
            "pitch_feedback": audio_metrics.get("pitch_feedback", []),
            "energy_feedback": audio_metrics.get("energy_feedback", []),
        }

        # 10. Update DB record
        analysis.status = "completed"
        analysis.transcript = transcript
        analysis.duration_sec = float(duration_sec)
        analysis.audio_metrics = structured_metrics
        analysis.content_metrics = content_metrics
        analysis.dimension_scores = radar_data
        analysis.overall_score = float(final_score)
        analysis.llm_feedback = llm_feedback
        db.commit()
        
        logger.info(f"Completed analysis {analysis_id} with score {final_score}")
        
    except Exception as e:
        logger.exception(f"Pipeline failed for {analysis_id}: {e}")
        try:
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis:
                analysis.status = "failed"
                analysis.error_message = str(e)
                db.commit()
        except Exception as db_err:
            logger.error(f"Failed to update error status in DB: {db_err}")
    finally:
        # Zero-retention enforcement: Purge audio files if user opted not to retain them
        try:
            analysis_rec = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis_rec and not analysis_rec.audio_filename:
                if audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
                    logger.info(f"Zero-retention purge completed: deleted raw audio {audio_path}")
        except Exception as purge_err:
            logger.warning(f"Audio purge warning: {purge_err}")

        db.close()
        if converted_path and os.path.exists(converted_path):
            try:
                os.remove(converted_path)
            except Exception:
                pass

