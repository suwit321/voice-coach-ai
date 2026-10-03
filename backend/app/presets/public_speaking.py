from .base import PresetDict

PUBLIC_SPEAKING_PRESET: PresetDict = {
    "key": "public_speaking",
    "name": "พูดต่อหน้าชุมชน",
    "icon": "🎤",
    "goal": "ดึงดูดและน่าจดจำ",
    "description": "วิเคราะห์การพูดต่อสาธารณะ เน้นพลังเสียง การดึงดูดความสนใจ และการทิ้งท้าย",
    "dimensions": [
        {"key": "energy", "label": "พลังเสียง", "weight": 0.25},
        {"key": "hook", "label": "เปิดดึงดูด", "weight": 0.20},
        {"key": "storytelling", "label": "เรื่องเล่า/ตัวอย่าง", "weight": 0.20},
        {"key": "engagement", "label": "การมีส่วนร่วม", "weight": 0.15},
        {"key": "conclusion", "label": "ทิ้งท้ายชัด", "weight": 0.20},
    ],
    "target_wpm": (120, 160),
    "checklist": [
        "เปิดด้วย hook ที่ดึงดูดความสนใจ",
        "มีเรื่องเล่าหรือตัวอย่างประกอบ",
        "ชวนผู้ฟังมีส่วนร่วม",
        "ทิ้งท้ายด้วย call to action ที่ชัดเจน"
    ],
    "filler_words": ["เอ่อ", "อ่า", "แบบว่า", "คือว่า", "ก็คือ", "อันนี้"],
    "enabled": True
}
