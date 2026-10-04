import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, BackgroundTasks, status, Query
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.analysis import Analysis
from ..schemas.analysis import AnalysisResponse, AnalysisListResponse, AnalysisStatusResponse, AnalysisListItem
from ..config import settings
from ..presets import get_preset

from ..services.pipeline import run_analysis_pipeline

router = APIRouter()

@router.post("", status_code=status.HTTP_202_ACCEPTED, response_model=AnalysisStatusResponse)
async def create_analysis(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    preset: str = Form(...),
    transcript: Optional[str] = Form(None),
    language: str = Form("th"),
    retain_audio: bool = Form(False),
    db: Session = Depends(get_db),
    x_session_id: Optional[str] = Header(None),
    x_llm_provider: Optional[str] = Header(None),
    x_llm_api_key: Optional[str] = Header(None),
    x_llm_model: Optional[str] = Header(None),
    x_stt_api_key: Optional[str] = Header(None)
):

    raw_content_type = (audio_file.content_type or "").split(';')[0].strip().lower()
    file_ext = os.path.splitext(audio_file.filename or "")[1].lower()
    if not file_ext:
        file_ext = ".webm"

    valid_content_types = set(settings.ALLOWED_AUDIO_TYPES + ["audio/webm", "audio/mp4", "audio/wav", "audio/mpeg", "audio/ogg", "audio/aac", "audio/x-m4a", "audio/m4a"])
    valid_extensions = set(settings.ALLOWED_EXTENSIONS + [".webm", ".mp4", ".wav", ".mp3", ".m4a", ".ogg", ".aac"])

    if raw_content_type and not (raw_content_type in valid_content_types or raw_content_type.startswith("audio/")):
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {raw_content_type}")
    
    preset_data = get_preset(preset)
    if not preset_data:
        raise HTTPException(status_code=400, detail="Invalid preset")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    if file_ext not in valid_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {file_ext}")

        
    filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
        
    # Check file size
    if os.path.getsize(filepath) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        os.remove(filepath)
        raise HTTPException(status_code=400, detail="File too large")

    # Create DB record (keep audio filename so user can listen back to their speech)
    db_analysis = Analysis(
        user_id=x_session_id,
        preset_key=preset,
        language=language,
        transcript=transcript,
        audio_filename=filename,
        status="queued"
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    # Launch background task
    background_tasks.add_task(
        run_analysis_pipeline,
        str(db_analysis.id),
        filepath,
        preset,
        transcript,
        language,
        x_llm_provider,
        x_llm_api_key,
        x_llm_model,
        x_stt_api_key
    )

    return AnalysisStatusResponse(id=db_analysis.id, status=db_analysis.status)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    preset_data = get_preset(analysis.preset_key)
    preset_info = {"key": analysis.preset_key, "name": preset_data["name"] if preset_data else "Unknown"}
        
    # Check if audio file is available on server
    audio_url = None
    if analysis.audio_filename:
        audio_filepath = os.path.join(settings.UPLOAD_DIR, analysis.audio_filename)
        if os.path.exists(audio_filepath):
            audio_url = f"/api/v1/analyses/{analysis.id}/audio"

    # Extract word_tokens, segments, and pauses from content_metrics / audio_metrics if present
    content_metrics = analysis.content_metrics or {}
    audio_metrics = analysis.audio_metrics or {}
    word_tokens = content_metrics.get("word_tokens")
    segments = content_metrics.get("segments")
    pauses = content_metrics.get("pauses") or audio_metrics.get("pauses")

    return AnalysisResponse(
        id=analysis.id,
        status=analysis.status,
        created_at=analysis.created_at,
        preset=preset_info,
        overall_score=analysis.overall_score,
        radar=analysis.dimension_scores,  # Assuming mapping
        metrics=analysis.audio_metrics,   # Assuming mapping
        feedback=analysis.llm_feedback,   # Assuming mapping
        transcript=analysis.transcript,
        audio_url=audio_url,
        word_tokens=word_tokens,
        segments=segments,
        pauses=pauses
    )

@router.get("/{analysis_id}/audio")
def get_analysis_audio(analysis_id: str, db: Session = Depends(get_db)):
    """Stream saved audio file for playback in frontend."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis or not analysis.audio_filename:
        raise HTTPException(status_code=404, detail="Audio file not found or not retained")
        
    filepath = os.path.join(settings.UPLOAD_DIR, analysis.audio_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file does not exist on disk")
        
    media_type = "audio/webm"
    if filepath.endswith(".wav"):
        media_type = "audio/wav"
    elif filepath.endswith(".mp3"):
        media_type = "audio/mpeg"
    elif filepath.endswith(".m4a"):
        media_type = "audio/mp4"

    return FileResponse(filepath, media_type=media_type)

@router.get("", response_model=AnalysisListResponse)
def list_analyses(
    skip: int = 0, 
    limit: int = 10, 
    x_session_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    query = db.query(Analysis)
    if x_session_id:
        query = query.filter(Analysis.user_id == x_session_id)
        
    total = query.count()
    analyses = query.order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()
    
    items = []
    for a in analyses:
        preset_data = get_preset(a.preset_key)
        preset_name = preset_data["name"] if preset_data else "Unknown"
        items.append(AnalysisListItem(
            id=a.id,
            created_at=a.created_at,
            preset_key=a.preset_key,
            preset_name=preset_name,
            overall_score=a.overall_score,
            status=a.status
        ))
        
    return AnalysisListResponse(items=items, total=total)

@router.delete("/session/purge-all", status_code=status.HTTP_200_OK)
def purge_session_data(x_session_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """PDPA/GDPR Right-to-be-Forgotten: Purge all session recordings and database entries."""
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
        
    records = db.query(Analysis).filter(Analysis.user_id == x_session_id).all()
    deleted_count = len(records)
    
    for r in records:
        if r.audio_filename:
            filepath = os.path.join(settings.UPLOAD_DIR, r.audio_filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception:
                    pass
        db.delete(r)
        
    db.commit()
    return {"status": "success", "purged_records": deleted_count}

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(analysis_id: str, db: Session = Depends(get_db)):

    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if analysis.audio_filename:
        filepath = os.path.join(settings.UPLOAD_DIR, analysis.audio_filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            
    db.delete(analysis)
    db.commit()
    return None

@router.get("/{analysis_id}/export")
def export_analysis(analysis_id: str, format: str = Query("md"), db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if format == "json":
        return {
            "id": analysis.id,
            "status": analysis.status,
            "overall_score": analysis.overall_score,
            "transcript": analysis.transcript,
            "metrics": analysis.audio_metrics,
            "feedback": analysis.llm_feedback
        }
    elif format == "md":
        preset_data = get_preset(analysis.preset_key)
        preset_name = preset_data["name"] if preset_data else analysis.preset_key
        feedback = analysis.llm_feedback or {}
        coherence = feedback.get("content_coherence") or {}
        
        md_lines = [
            f"# รายงานการวิเคราะห์การพูด: {preset_name}",
            f"- **คะแนนรวม:** {analysis.overall_score}/100",
            f"- **สถานะ:** {analysis.status}",
            f"- **วันที่:** {analysis.created_at}",
            "",
            "## การประเมินเนื้อหาและความเข้าใจ (Content & Coherence)",
            f"- **ความเข้าใจ (ฟังรู้เรื่องหรือไม่):** {coherence.get('clarity_level', 'ปกติ')}",
            f"- **การจัดลำดับ (พูดเป็นขั้นตอน):** {coherence.get('structure_flow', 'ปกติ')}",
            f"- **ความกระชับ (พูดวกวนหรือไม่):** {coherence.get('circular_analysis', 'ปกติ')}",
            f"- **คะแนนความต่อเนื่องของเนื้อหา:** {coherence.get('coherence_score', 'N/A')}/100",
            "",
            "## จุดแข็ง (Strengths)"
        ]
        for s in feedback.get("strengths", []):
            md_lines.append(f"- {s}")

        md_lines.extend(["", "## จุดที่ควรพัฒนา (Priorities)"])
        for p in feedback.get("priorities", []):
            if isinstance(p, dict):
                md_lines.append(f"- **{p.get('title')}:** {p.get('recommendation')} *(หลักฐาน: {p.get('evidence')})*")
            else:
                md_lines.append(f"- {p}")

        md_lines.extend(["", "## เนื้อหาเสียงที่พูด (Transcript)", f"> {analysis.transcript or 'ไม่มีเนื้อหาข้อความ'}", ""])
        md_content = "\n".join(md_lines)
        return Response(content=md_content, media_type="text/markdown")
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'md' or 'json'")


@router.patch("/{analysis_id}/feedback")
def update_feedback(analysis_id: str, rating: int = Query(...), db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if rating not in [1, -1]:
        raise HTTPException(status_code=400, detail="Rating must be 1 (thumbs up) or -1 (thumbs down)")
        
    analysis.feedback_rating = rating
    db.commit()
    return {"status": "success"}
