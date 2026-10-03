from .base import PresetDict

MEETING_PRESET: PresetDict = {
    "key": "meeting",
    "name": "การประชุม/รายงาน",
    "icon": "🏢",
    "goal": "ชัด กระชับ เป็นทางการ",
    "description": "วิเคราะห์การรายงานในที่ประชุม เน้นความกระชับ ข้อมูลครบถ้วน และมี action items",
    "dimensions": [
        {"key": "conciseness", "label": "ความกระชับ", "weight": 0.20},
        {"key": "completeness", "label": "ข้อมูลครบ", "weight": 0.25},
        {"key": "formality", "label": "ความเป็นทางการ", "weight": 0.20},
        {"key": "structure", "label": "โครงสร้าง", "weight": 0.20},
        {"key": "fillers", "label": "ควบคุมคำฟุ่มเฟือย", "weight": 0.15},
    ],
    "target_wpm": (100, 140),
    "checklist": [
        "เปิดด้วยวัตถุประสงค์ที่ชัดเจน",
        "มีข้อมูลสนับสนุน/ตัวเลข",
        "สรุปประเด็นและ action items"
    ],
    "filler_words": ["เอ่อ", "อ่า", "แบบว่า", "คือว่า", "ก็คือ", "อันนี้"],
    "enabled": True
}
