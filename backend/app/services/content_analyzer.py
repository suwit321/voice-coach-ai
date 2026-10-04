import re
from pythainlp.tokenize import Tokenizer
from pythainlp.corpus.common import thai_words
from pythainlp.util import dict_trie
from typing import List, Dict, Any, Tuple

THAI_FILLER_WORDS_DEFAULT = {
    "เอ่อ", "อ่า", "เอิ่ม", "อืม", "คือว่า", 
    "แบบว่า", "ก็คือ", "อันนี้", "อะไรแบบนี้", 
    "นะค่ะ", "อะนะ", "แบบ"
}

# Signposting & sequencing markers in Thai (พูดเป็นขั้นตอน)
STEP_MARKERS = [
    "ขั้นแรก", "ขั้นตอนแรก", "ประการแรก", "ข้อแรก", "หนึ่งคือ", "ข้อที่หนึ่ง",
    "ลำดับแรก", "ขั้นที่สอง", "ประการที่สอง", "ข้อสอง", "ถัดมา", "ถัดไป", 
    "ต่อมา", "จากนั้น", "ในส่วนถัดไป", "อีกประเด็นหนึ่ง", "นอกจากนี้",
    "สุดท้าย", "ประการสุดท้าย", "ท้ายที่สุด", "สรุปคือ", "สรุปได้ว่า", "ข้อสรุป"
]

# Introduction markers (การเปิดเรื่อง)
INTRO_MARKERS = [
    "สวัสดี", "ขอต้อนรับ", "วันนี้จะมา", "วันนี้ผมจะ", "วันนี้ดิฉันจะ", 
    "ขอเริ่มจาก", "หัวข้อในวันนี้", "วัตถุประสงค์", "เป้าหมายของ", "ยินดีต้อนรับ"
]

# Conclusion markers (การสรุปประเด็น)
CONCLUSION_MARKERS = [
    "สรุปคือ", "สรุปได้ว่า", "ข้อสรุป", "ท้ายที่สุด", "สุดท้ายนี้",
    "ดังนั้น", "สิ่งที่ต้องทำต่อไป", "action item", "ขั้นตอนถัดไป", 
    "ขอบคุณครับ", "ขอบคุณค่ะ", "จึงเรียนมาเพื่อ"
]

# Circular & rambling markers (การพูดวน/ซ้ำประเด็นเดิม)
CIRCULAR_MARKERS = [
    "อย่างที่บอกไปแล้ว", "ที่พูดไปเมื่อกี้", "อย่างที่กล่าวไป",
    "ก็เหมือนเดิม", "วนกลับมา", "อย่างที่ว่าไป", "ที่บอกไว้ข้างต้น"
]

def _build_tokenizer(extra_fillers: set[str] | None = None) -> Tuple[Tokenizer, set[str]]:
    all_fillers = THAI_FILLER_WORDS_DEFAULT.union(extra_fillers or set())
    # Add step markers and circular markers to dictionary to preserve token compounds
    all_words = set(thai_words()).union(all_fillers).union(set(STEP_MARKERS)).union(set(CIRCULAR_MARKERS))
    trie = dict_trie(all_words)
    return Tokenizer(custom_dict=trie, engine='newmm'), all_fillers

def analyze_content(transcript: str, duration_sec: float, preset_filler_words: List[str] = None) -> Dict[str, Any]:
    """Analyze Thai transcript for content metrics, structural flow, clarity, and coherence.
    
    Args:
        transcript: The text transcript
        duration_sec: Total duration of audio in seconds
        preset_filler_words: List of extra filler words to look for
        
    Returns:
        dict: Detailed content metrics
    """
    if not transcript or not transcript.strip():
        return {
            'word_count': 0, 'wpm': 0.0, 'filler_count': 0, 'filler_words': [],
            'filler_percentage': 0.0, 'filler_positions': [], 'avg_sentence_length': 0.0,
            'long_sentences': 0, 'repeated_words': [],
            'step_markers_found': [], 'has_intro': False, 'has_conclusion': False,
            'circular_count': 0, 'circular_markers_found': [],
            'coherence_score': 70.0,
            'clarity_level': 'ยังไม่มีข้อความสำหรับวิเคราะห์',
            'structure_flow': 'ไม่พบเนื้อหาข้อความ',
            'circular_analysis': 'ยังไม่มีข้อมูลข้อความ'
        }

    tokenizer, all_fillers = _build_tokenizer(set(preset_filler_words) if preset_filler_words else None)
    
    # Tokenize
    tokens = tokenizer.word_tokenize(transcript)
    
    # Filter out whitespace and basic punctuation
    valid_tokens = [t for t in tokens if t.strip() and not re.match(r'^[\s\W_]+$', t)]
    word_count = len(valid_tokens)
    
    # WPM
    wpm = word_count / (duration_sec / 60) if duration_sec > 0 else 0.0
    
    # Fillers detection
    filler_counts: Dict[str, int] = {}
    filler_positions: List[Dict[str, Any]] = []
    
    for idx, token in enumerate(valid_tokens):
        if token in all_fillers:
            filler_counts[token] = filler_counts.get(token, 0) + 1
            filler_positions.append({'index': idx, 'word': token})
            
    filler_count = sum(filler_counts.values())
    filler_percentage = (filler_count / word_count * 100) if word_count > 0 else 0.0
    filler_words_list = [{'word': w, 'count': c} for w, c in filler_counts.items()]
    
    # Sentence analysis
    sentence_boundaries = re.split(r'(?:ครับ|ค่ะ|นะครับ|นะคะ|\n|\.|\?|!)', transcript)
    sentences = [s.strip() for s in sentence_boundaries if s.strip()]
    
    if sentences:
        sentence_lengths = [len([t for t in tokenizer.word_tokenize(s) if t.strip() and not re.match(r'^[\s\W_]+$', t)]) for s in sentences]
        avg_sentence_length = sum(sentence_lengths) / len(sentences)
        long_sentences = sum(1 for l in sentence_lengths if l > 20)
    else:
        avg_sentence_length = 0.0
        long_sentences = 0
        
    # Repeated words/phrases (simple word frequency > 3, excluding common grammatical stop words)
    stop_words = {"ที่", "การ", "ความ", "ใน", "และ", "เป็น", "มี", "ได้", "ให้", "จะ", "ไป", "มา", "ของ", "กับ", "นี้", "ว่า"}
    word_freq: Dict[str, int] = {}
    for token in valid_tokens:
        if token not in all_fillers and token not in stop_words and len(token) > 1:
            word_freq[token] = word_freq.get(token, 0) + 1
            
    repeated_words = [{'word': k, 'count': v} for k, v in word_freq.items() if v > 3]

    # --- Structural & Coherence Analysis (พูดเป็นขั้นตอน / วกวน / ฟังรู้เรื่อง) ---
    step_markers_found = [m for m in STEP_MARKERS if m in transcript]
    has_intro = any(m in transcript for m in INTRO_MARKERS)
    has_conclusion = any(m in transcript for m in CONCLUSION_MARKERS)
    
    circular_markers_found = [m for m in CIRCULAR_MARKERS if m in transcript]
    circular_count = len(circular_markers_found) + (1 if len(repeated_words) >= 3 else 0)

    # Coherence Score calculation (0 - 100)
    coherence_score = 80.0
    if step_markers_found:
        coherence_score += 10.0
    if has_intro:
        coherence_score += 5.0
    if has_conclusion:
        coherence_score += 5.0
    if circular_count > 0:
        coherence_score -= (circular_count * 8.0)
    if filler_percentage > 4.0:
        coherence_score -= 10.0
    if long_sentences > 3:
        coherence_score -= 5.0
    coherence_score = min(98.0, max(45.0, coherence_score))

    # Clarity level (ฟังรู้เรื่องหรือไม่)
    if filler_percentage <= 2.5 and avg_sentence_length <= 18 and long_sentences <= 1:
        clarity_level = "ฟังเข้าใจง่าย ชัดเจน ตรงประเด็น"
    elif filler_percentage <= 5.0 and avg_sentence_length <= 25:
        clarity_level = "พอฟังเข้าใจได้ มีจุดสะดุดเล็กน้อย"
    else:
        clarity_level = "ประโยคค่อนข้างยาวหรือมีคำแทรกมาก อาจทำให้จับใจความยาก"

    # Structure flow (พูดเป็นขั้นตอนหรือไม่)
    if len(step_markers_found) >= 2 or (has_intro and has_conclusion):
        structure_flow = f"มีการเรียงลำดับเนื้อหาเป็นขั้นตอนชัดเจน (พบคำเชื่อมบอกลำดับ: {', '.join(step_markers_found[:3]) if step_markers_found else 'มีเปิดเรื่องและสรุป'})"
    elif len(step_markers_found) == 1 or has_intro or has_conclusion:
        structure_flow = "มีโครงสร้างในระดับปานกลาง ควรเพิ่มคำเชื่อมบอกลำดับหรือสรุปทิ้งท้ายให้ชัดเจนขึ้น"
    else:
        structure_flow = "โครงสร้างแบบอิสระ ควรจัดเป็น 3 ช่วง (เปิดเรื่อง - ประเด็นหลัก 1-2-3 - สรุปประเด็น)"

    # Circular analysis (วกวนหรือไม่)
    if circular_count == 0 and len(repeated_words) <= 1:
        circular_analysis = "ไม่พบการพูดวกวน เนื้อหากระชับ ไหลลื่นตรงประเด็น"
    elif circular_count == 1 or len(repeated_words) <= 2:
        circular_analysis = "มีการย้ำประเด็นหรือใช้คำเดิมซ้ำในบางช่วงเล็กน้อย แต่ยังคงจับใจความได้"
    else:
        circular_analysis = "พบการพูดวนซ้ำประเด็นเดิมหลายรอบ แนะนำให้สรุปประเด็นแรกให้จบก่อนขึ้นประเด็นใหม่"

    # Word-by-word tagged tokens for interactive verbatim view
    word_tokens: List[Dict[str, Any]] = []
    for idx, token in enumerate(valid_tokens):
        w_type = "normal"
        w_note = None
        if token in all_fillers:
            w_type = "filler"
            w_note = "คำฟุ่มเฟือย/คำติดปาก"
        elif any(token in m for m in STEP_MARKERS):
            w_type = "step"
            w_note = "คำเชื่อมลำดับขั้นตอน"
        elif any(token in m for m in CIRCULAR_MARKERS):
            w_type = "circular"
            w_note = "คำส่อแววพูดวนซ้ำ"
        elif any(token == rw["word"] for rw in repeated_words):
            w_type = "repeated"
            w_note = "คำที่ใช้ซ้ำบ่อย"
        
        word_tokens.append({
            "index": idx,
            "text": token,
            "type": w_type,
            "note": w_note
        })

    return {
        'word_count': word_count,
        'wpm': round(wpm, 1),
        'filler_count': filler_count,
        'filler_words': filler_words_list,
        'filler_percentage': round(filler_percentage, 1),
        'filler_positions': filler_positions,
        'word_tokens': word_tokens,
        'avg_sentence_length': round(avg_sentence_length, 1),
        'long_sentences': long_sentences,
        'repeated_words': repeated_words,
        'step_markers_found': step_markers_found,
        'has_intro': has_intro,
        'has_conclusion': has_conclusion,
        'circular_count': circular_count,
        'circular_markers_found': circular_markers_found,
        'coherence_score': round(coherence_score, 1),
        'clarity_level': clarity_level,
        'structure_flow': structure_flow,
        'circular_analysis': circular_analysis,
    }
