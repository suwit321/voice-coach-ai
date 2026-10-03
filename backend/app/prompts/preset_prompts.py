from app.prompts.system_prompt import SYSTEM_PROMPT

def build_analysis_prompt(preset_config: dict, audio_metrics: dict, content_metrics: dict, transcript: str) -> str:
    """Build the complete prompt for LLM analysis including comprehensibility and coherence analysis."""
    preset_name = preset_config.get("name", "การพูดทั่วไป")
    dimensions = preset_config.get("dimensions", [])
    
    dim_lines = [f"- key: '{d.get('key')}', label: '{d.get('label')}' (น้ำหนัก {d.get('weight', 0.2):.2f})" for d in dimensions]
    dim_instructions = "\n".join(dim_lines)
    
    prompt = f"""{SYSTEM_PROMPT}

บริบทการประเมิน (Preset): {preset_name}
เป้าหมายของบริบทนี้: {preset_config.get('goal', 'ชัดเจนและเหมาะสม')}

ข้อมูลตัวชี้วัดจริงจากไฟล์เสียงและภาษาไทย:
- ความเร็วการพูด (WPM): {content_metrics.get('wpm', 0):.1f} คำต่อนาที (ช่วงเป้าหมาย: {preset_config.get('target_wpm_min', 100)}-{preset_config.get('target_wpm_max', 150)} WPM)
- สัดส่วนคำฟุ่มเฟือย: {content_metrics.get('filler_percentage', 0):.1f}% (พบ {content_metrics.get('filler_count', 0)} ครั้ง เช่น {', '.join([f['word'] for f in content_metrics.get('filler_words', [])[:4]]) or 'ไม่พบ'})
- จำนวนการหยุดพัก: {audio_metrics.get('pause_count', 0)} ครั้ง (หยุดนานผิดปกติ {audio_metrics.get('long_pause_count', 0)} ครั้ง)
- ค่าเฉลี่ยความยาวประโยค: {content_metrics.get('avg_sentence_length', 0):.1f} คำ/ประโยค
- ค่าความถี่โทนเสียง (Pitch Std): {audio_metrics.get('pitch_std', 0):.1f} Hz (หาก <15 Hz ถือว่าราบเรียบไร้อารมณ์)

ข้อความที่ผู้พูดกล่าวจริง (Transcript):
\"\"\"
{transcript or '(ไม่มีข้อความที่ถอดเสียง)'}
\"\"\"

งานที่ต้องวิเคราะห์อย่างละเอียด:
1. **ประเมิน 5 มิติของ Preset**: ให้คะแนน 0-100 พร้อมเหตุผลอ้างอิงหลักฐานจริง
2. **วิเคราะห์ความเข้าใจและโครงสร้างเนื้อหา (Content & Structure Analysis)**:
   - **ฟังรู้เรื่องหรือไม่ (Clarity & Comprehensibility)**: ผู้ฟังทั่วไปจะเข้าใจได้ง่ายหรือไม่ ประโยคซับซ้อนเกินไปหรือใช้คำกำกวมหรือไม่
   - **พูดเป็นขั้นตอนหรือไม่ (Step-by-step Sequencing)**: มีการจัดลำดับ 1-2-3 หรือเปิดเรื่อง-เนื้อหา-สรุปหรือไม่ หรือข้ามไปข้ามมา
   - **พูดวกวนหรือไม่ (Circular & Rambling)**: มีการย้ำคิดย้ำพูด วนกลับมาเรื่องเดิมซ้ำๆ นอกเรื่อง หรือยืดเยื้อหรือไม่
3. **จุดแข็งและจุดควรพัฒนา**: ชี้ข้อดี 2-3 ข้อ และสิ่งที่ควรปรับปรุง 1-3 ข้อโดยอ้างอิงข้อความจริง
4. **ตัวอย่างการปรับสำนวน (Content Rewrites)**: ยกประโยคเดิมที่วกวนหรือเยิ่นเย้อ มาเขียนใหม่ให้กระชับ ชัดเจน

ให้ตอบกลับเป็นโครงสร้าง JSON ดังนี้เท่านั้น:
{{
  "overall_score": 82.5,
  "dimension_scores": [
    {{"key": "dim_key", "label": "ชื่อมิติ", "score": 85.0, "reason": "เหตุผลสั้นๆ"}}
  ],
  "strengths": ["จุดเด่น 1", "จุดเด่น 2"],
  "priorities": [
    {{
      "title": "หัวข้อที่ควรปรับปรุง",
      "evidence": "หลักฐานจากข้อความจริงหรือตัวเลข",
      "impact": "high",
      "recommendation": "คำแนะนำเชิงปฏิบัติ",
      "exercise": "แบบฝึกหัดสำหรับฝึกฝน"
    }}
  ],
  "content_rewrites": [
    {{
      "original": "ประโยคเดิมที่พูด",
      "improved": "ประโยคที่ปรับปรุงแล้วให้กระชับ",
      "reason": "เหตุผลในการปรับ"
    }}
  ],
  "practice_plan": ["แผนฝึกซ้อม 1", "แผนฝึกซ้อม 2"],
  "limitations": ["ประเมินจากไฟล์เสียงและ transcript ที่บันทึกไว้"],
  "content_coherence": {{
    "clarity_level": "ฟังเข้าใจง่าย ชัดเจน ตรงประเด็น (หรือ พอฟังเข้าใจได้ / เข้าใจยาก)",
    "structure_flow": "วิเคราะห์การลำดับขั้นตอน (เช่น มีการเปิด-กลาง-สรุปเป็นขั้นตอนชัดเจน)",
    "circular_analysis": "วิเคราะห์การพูดวกวน (เช่น ไม่พบการพูดวกวน หรือ มีการย้ำประเด็นเดิมในท่อน...)",
    "coherence_score": 85.0,
    "details": [
      "ข้อสังเกตเจาะลึก 1",
      "ข้อสังเกตเจาะลึก 2"
    ]
  }}
}}
"""
    return prompt
