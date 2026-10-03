from typing import Dict, Any

def calculate_acoustic_score(audio_metrics: Dict[str, Any], preset_config: Dict[str, Any]) -> float:
    """Calculate acoustic score (0-100) based on pace, energy, pitch, pauses."""
    score = 0.0
    
    # Pace score (30% weight)
    wpm = audio_metrics.get('wpm', 120)  # Need WPM injected or passed from content
    # WPM should ideally come from content analysis, fallback if not available
    target_wpm = preset_config.get('target_wpm', [120, 160])
    
    pace_score = 0
    if target_wpm[0] <= wpm <= target_wpm[1]:
        pace_score = 95
    else:
        dist = min(abs(wpm - target_wpm[0]), abs(wpm - target_wpm[1]))
        pace_score = max(50, 90 - (dist * 0.5))
        
    # Energy score (25% weight)
    energy_std = audio_metrics.get('energy_std', 0)
    energy_score = 85 if energy_std > 0.05 else 60
    
    # Pitch variation score (20% weight)
    pitch_std = audio_metrics.get('pitch_std', 0)
    if pitch_std < 15:
        pitch_score = 50 # monotone
    elif 15 <= pitch_std <= 50:
        pitch_score = 90 # good range
    else:
        pitch_score = 75 # maybe too wild
        
    # Pause score (25% weight)
    pauses = audio_metrics.get('pause_count', 0)
    long_pauses = audio_metrics.get('long_pause_count', 0)
    pause_score = max(50, 95 - (long_pauses * 5))
    
    final = (pace_score * 0.30) + (energy_score * 0.25) + (pitch_score * 0.20) + (pause_score * 0.25)
    return min(98.5, max(1.0, final)) # Never return 100

def calculate_content_score(content_metrics: Dict[str, Any], preset_config: Dict[str, Any]) -> float:
    """Calculate content score (0-100) based on fillers, sentence length, repetition."""
    # Filler ratio score (30% weight)
    filler_pct = content_metrics.get('filler_percentage', 0)
    if filler_pct <= 1.0:
        filler_score = 95
    elif filler_pct <= 3.0:
        filler_score = 85
    elif filler_pct <= 5.0:
        filler_score = 70
    else:
        filler_score = 55
        
    # Sentence complexity (20% weight)
    avg_len = content_metrics.get('avg_sentence_length', 10)
    sentence_score = 85 if 5 <= avg_len <= 20 else 70
    
    # Repetition score (20% weight)
    rep = len(content_metrics.get('repeated_words', []))
    rep_score = max(50, 95 - (rep * 5))
    
    # Language register (30% weight) - hard to judge heuristically, default high
    register_score = 85
    
    final = (filler_score * 0.30) + (sentence_score * 0.20) + (rep_score * 0.20) + (register_score * 0.30)
    return min(98.5, max(1.0, final))

def calculate_final_score(acoustic: float, content: float, preset_fit: float) -> float:
    """Final Score = 0.40 × Acoustic + 0.35 × Content + 0.25 × Preset Fit"""
    final = 0.40 * acoustic + 0.35 * content + 0.25 * preset_fit
    # Never return exactly 100
    if final >= 99.5:
        return 98.5
    return round(final, 1)

def generate_rule_based_feedback(audio_metrics: dict, content_metrics: dict, preset_config: dict) -> dict:
    """Generate fallback feedback when LLM fails. Returns dict matching LLM response schema."""
    dimensions = preset_config.get("dimensions", [
        {"key": "pace", "label": "จังหวะการพูด", "weight": 0.25},
        {"key": "energy", "label": "พลังเสียง", "weight": 0.25},
        {"key": "clarity", "label": "ความชัดเจน", "weight": 0.25},
        {"key": "fluency", "label": "ความลื่นไหล", "weight": 0.25},
    ])
    
    wpm = content_metrics.get("wpm", audio_metrics.get("wpm", 120))
    filler_count = content_metrics.get("filler_count", 0)
    filler_pct = content_metrics.get("filler_percentage", 0.0)
    
    dim_scores = []
    for dim in dimensions:
        key = dim.get("key", "")
        label = dim.get("label", "")
        if "wpm" in key or "pace" in key or "กระชับ" in label:
            score = 88.0 if 100 <= wpm <= 150 else 72.0
            reason = f"ความเร็วในการพูดอยู่ที่ประมาณ {wpm:.1f} คำต่อนาที"
        elif "energy" in key or "พลัง" in label:
            score = 82.0
            reason = "ระดับพลังเสียงและความต่อเนื่องโดยรวมอยู่ในเกณฑ์ปกติ"
        elif "filler" in key or "ฟุ่มเฟือย" in label:
            score = max(50.0, 95.0 - (filler_pct * 8))
            reason = f"พบคำฟุ่มเฟือย {filler_count} ครั้ง ({filler_pct:.1f}% ของคำทั้งหมด)"
        elif "formality" in key or "ทางการ" in label:
            score = 85.0
            reason = "ระดับภาษาและน้ำเสียงมีความเหมาะสมกับบริบท"
        else:
            score = 80.0
            reason = f"การประเมินด้าน {label} ตามเกณฑ์พื้นฐาน"
        dim_scores.append({
            "key": key or "dim",
            "label": label or "มิติ",
            "score": round(score, 1),
            "reason": reason
        })
        
    avg_score = round(sum(d["score"] for d in dim_scores) / max(1, len(dim_scores)), 1)
    
    priorities = []
    if filler_count > 0:
        priorities.append({
            "title": "ลดการใช้คำฟุ่มเฟือย (Filler Words)",
            "evidence": f"ตรวจพบคำฟุ่มเฟือย {filler_count} ครั้งในระหว่างการพูด",
            "impact": "high" if filler_pct > 3.0 else "medium",
            "recommendation": "เมื่อคิดคำไม่ออก ให้หยุดนิ่งเพื่อหายใจแทนการออกเสียง เอ่อ, อ่า",
            "exercise": "ฝึกพูดประโยคสั้น 1 นาทีโดยห้ามมีคำฟุ่มเฟือยเด็ดขาด"
        })
    if wpm > 160:
        priorities.append({
            "title": "ปรับจังหวะการพูดให้ช้าลงเล็กน้อย",
            "evidence": f"ความเร็วเฉลี่ย {wpm:.1f} WPM ซึ่งอาจทำให้ผู้ฟังตามไม่ทันในบางช่วง",
            "impact": "medium",
            "recommendation": "เว้นจังหวะหลังจบแต่ละใจความสำคัญ 1-2 วินาที",
            "exercise": "ฝึกอ่านออกเสียงโดยแตะนิ้วตามจังหวะช้าๆ เพื่อควบคุมความเร็ว"
        })
    elif wpm < 95 and wpm > 0:
        priorities.append({
            "title": "เพิ่มความต่อเนื่องและกระชับ",
            "evidence": f"ความเร็วเฉลี่ย {wpm:.1f} WPM ค่อนข้างช้า",
            "impact": "medium",
            "recommendation": "จัดเรียงลำดับหัวข้อล่วงหน้าเพื่อลดความลังเลใจขณะพูด",
            "exercise": "ฝึกพูดสรุปใจความสำคัญในเวลาจำกัด 30 วินาที"
        })
        
    if not priorities:
        priorities.append({
            "title": "รักษามาตรฐานความสม่ำเสมอในการสื่อสาร",
            "evidence": "จังหวะและความลื่นไหลอยู่ในเกณฑ์ดี",
            "impact": "low",
            "recommendation": "ฝึกฝนต่อไปเพื่อเพิ่มความคล่องแคล่วและเป็นธรรมชาติ",
            "exercise": "บันทึกเสียงและฝึกซ้ำเพื่อความมั่นใจยิ่งขึ้น"
        })

    strengths = [
        "จังหวะการพูดและการออกเสียงมีโครงสร้างชัดเจน",
        "มีความพยายามรักษาความต่อเนื่องในการสื่อสาร"
    ]
    if filler_pct < 2.0:
        strengths.append("ควบคุมคำฟุ่มเฟือยได้ดีเยี่ยม")

    rewrites = []
    if filler_count > 0 and content_metrics.get("filler_words"):
        fw_sample = content_metrics["filler_words"][0]["word"]
        rewrites.append({
            "original": f"...{fw_sample} วันนี้จะขอรายงาน...",
            "improved": "วันนี้ขอรายงานความคืบหน้า...",
            "reason": f"ตัดคำว่า '{fw_sample}' เพื่อให้ประโยคกระชับและน่าเชื่อถือยิ่งขึ้น"
        })

    coherence_data = {
        "clarity_level": content_metrics.get("clarity_level", "ฟังเข้าใจง่าย ชัดเจน ตรงประเด็น"),
        "structure_flow": content_metrics.get("structure_flow", "มีโครงสร้างการพูดตามลำดับ"),
        "circular_analysis": content_metrics.get("circular_analysis", "ไม่พบการพูดวกวน"),
        "coherence_score": float(content_metrics.get("coherence_score", 85.0)),
        "details": [
            f"การจัดลำดับขั้นตอน: {content_metrics.get('structure_flow', 'ปกติ')}",
            f"ระดับความชัดเจน: {content_metrics.get('clarity_level', 'ปกติ')}",
            f"การควบคุมประเด็น: {content_metrics.get('circular_analysis', 'ปกติ')}"
        ]
    }

    return {
        "overall_score": avg_score,
        "dimension_scores": dim_scores,
        "strengths": strengths,
        "priorities": priorities,
        "content_rewrites": rewrites,
        "practice_plan": [
            "ฝึกพูดสรุปใจความสั้นๆ 1-2 นาทีทุกวัน",
            "สังเกตคำฟุ่มเฟือยของตนเองและแทนที่ด้วยการหยุดนิ่ง (Pause)"
        ],
        "limitations": [
            "ผลวิเคราะห์นี้สร้างจากระบบ Rule-based กฎเกณฑ์พื้นฐาน สำหรับคำแนะนำเชิงลึกสามารถเปิดใช้งาน LLM Adapter ได้"
        ],
        "content_coherence": coherence_data
    }


