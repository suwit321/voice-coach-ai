import re
from typing import Tuple, Dict, List

# Regular expressions for Thai and international sensitive PII
THAI_PHONE_REGEX = re.compile(r'\b(0[2-9]\d{1}[-.\s]?\d{3,4}[-.\s]?\d{4}|0[689]\d{8})\b')
THAI_CITIZEN_ID_REGEX = re.compile(r'\b(\d{1}[-.\s]?\d{4}[-.\s]?\d{5}[-.\s]?\d{2}[-.\s]?\d{1}|\d{13})\b')
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b')
CREDIT_CARD_REGEX = re.compile(r'\b(?:\d{4}[-.\s]?){3}\d{4}\b')

def anonymize_text(text: str) -> Tuple[str, Dict[str, int]]:
    """Scan and redact Personally Identifiable Information (PII) from transcript before AI processing.
    
    Replaces:
    - Thai Phone Numbers -> [ปกปิดเบอร์โทรศัพท์]
    - National Citizen ID -> [ปกปิดเลขบัตรประชาชน]
    - Emails -> [ปกปิดอีเมล]
    - Credit Card / Financial IDs -> [ปกปิดข้อมูลการเงิน]
    
    Returns:
        Tuple[str, Dict[str, int]]: (anonymized_text, redacted_counts)
    """
    if not text:
        return text, {}

    redacted_counts = {
        "phone_numbers": 0,
        "citizen_ids": 0,
        "emails": 0,
        "credit_cards": 0
    }

    def count_and_replace(match, category: str, replacement: str):
        redacted_counts[category] += 1
        return replacement

    # 1. Citizen ID
    text = THAI_CITIZEN_ID_REGEX.sub(lambda m: count_and_replace(m, "citizen_ids", "[ปกปิดเลขบัตรประชาชน]"), text)
    
    # 2. Credit Card
    text = CREDIT_CARD_REGEX.sub(lambda m: count_and_replace(m, "credit_cards", "[ปกปิดข้อมูลการเงิน]"), text)
    
    # 3. Phone Numbers
    text = THAI_PHONE_REGEX.sub(lambda m: count_and_replace(m, "phone_numbers", "[ปกปิดเบอร์โทรศัพท์]"), text)
    
    # 4. Emails
    text = EMAIL_REGEX.sub(lambda m: count_and_replace(m, "emails", "[ปกปิดอีเมล]"), text)

    return text, redacted_counts
