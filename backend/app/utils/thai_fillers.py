from typing import List

THAI_FILLER_WORDS = {
    "เอ่อ": "คำสร้อย (เอ่อ)",
    "อ่า": "คำสร้อย (อ่า)",
    "เอิ่ม": "คำสร้อย (เอิ่ม)",
    "อืม": "คำสร้อย (อืม)",
    "คือว่า": "คำเชื่อมที่ไม่จำเป็น (คือว่า)",
    "แบบว่า": "คำเชื่อมที่ไม่จำเป็น (แบบว่า)",
    "ก็คือ": "คำเชื่อมที่ไม่จำเป็น (ก็คือ)",
    "อันนี้": "คำสรรพนามที่ไม่จำเป็น (อันนี้)",
    "อะไรแบบนี้": "วลีที่ไม่จำเป็น (อะไรแบบนี้)",
    "นะค่ะ": "คำลงท้ายที่ผิด/ไม่จำเป็น (นะค่ะ)",
    "อะนะ": "คำลงท้ายที่ไม่จำเป็น (อะนะ)"
}

def highlight_fillers_in_text(text: str, filler_words: List[str]) -> str:
    """Return text with filler words wrapped in markers like [FILLER:เอ่อ]"""
    highlighted = text
    # Sort by length descending to prevent partial replacements
    sorted_fillers = sorted(filler_words, key=len, reverse=True)
    
    for fw in sorted_fillers:
        if fw in highlighted:
            # We use a placeholder approach if they overlap, but a simple replace works for most
            highlighted = highlighted.replace(fw, f"[FILLER:{fw}]")
            
    return highlighted

def get_filler_suggestions(filler_word: str) -> str:
    """Return suggestion for replacing the filler"""
    suggestions = {
        "เอ่อ": "ลองหยุดเงียบ (Pause) แทนการเปล่งเสียง 'เอ่อ'",
        "อ่า": "ลองหยุดเงียบ (Pause) แทนการเปล่งเสียง 'อ่า'",
        "แบบว่า": "พยายามพูดเข้าประเด็นโดยตรงโดยไม่ต้องใช้ 'แบบว่า'",
        "คือว่า": "เริ่มต้นประโยคได้เลยโดยไม่ต้องมี 'คือว่า'"
    }
    return suggestions.get(filler_word, "ลองหยุดคิดสักครู่ (Pause) แทนการใช้คำนี้")
