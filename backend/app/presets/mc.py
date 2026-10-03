from .base import PresetDict

MC_PRESET: PresetDict = {
    "key": "mc",
    "name": "พิธีกร",
    "icon": "🎭",
    "goal": "คุม flow และบรรยากาศ",
    "description": "วิเคราะห์การดำเนินรายการ เน้นความลื่นไหล การคุมเวลา และพลังเสียงสม่ำเสมอ",
    "dimensions": [
        {"key": "fluency", "label": "ความลื่นไหล", "weight": 0.25},
        {"key": "time_management", "label": "คุมเวลา", "weight": 0.15},
        {"key": "consistency", "label": "พลังสม่ำเสมอ", "weight": 0.25},
        {"key": "transitions", "label": "คำเชื่อม", "weight": 0.15},
        {"key": "audience_pull", "label": "ดึงผู้ฟัง", "weight": 0.20},
    ],
    "target_wpm": (130, 170),
    "checklist": [
        "ใช้คำเชื่อมเปลี่ยนช่วงอย่างราบรื่น",
        "คุมเวลาแต่ละช่วงได้ดี",
        "รักษาพลังเสียงสม่ำเสมอตลอดรายการ",
        "กู้สถานการณ์ได้เมื่อสะดุด"
    ],
    "filler_words": ["เอ่อ", "อ่า", "แบบว่า", "คือว่า", "ก็คือ", "อันนี้"],
    "enabled": True
}
