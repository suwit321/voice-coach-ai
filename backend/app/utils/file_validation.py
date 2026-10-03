import re
from typing import Tuple

def validate_upload(filename: str, content_type: str, file_size: int, settings) -> Tuple[bool, str]:
    """Validate file extension, content type, and size. Return (is_valid, error_message)."""
    allowed_extensions = {'.wav', '.mp3', '.m4a', '.ogg'}
    allowed_mime_types = {'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/x-m4a'}
    
    ext = '.' + filename.split('.')[-1].lower() if '.' in filename else ''
    
    if ext not in allowed_extensions:
        return False, f"Unsupported file extension: {ext}"
        
    if content_type not in allowed_mime_types:
        return False, f"Unsupported content type: {content_type}"
        
    # max_upload_size usually from settings
    max_size = getattr(settings, 'MAX_UPLOAD_SIZE_MB', 50) * 1024 * 1024
    if file_size > max_size:
        return False, f"File size exceeds limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
        
    return True, ""

def sanitize_filename(filename: str) -> str:
    """Remove dangerous characters from filename."""
    # Keep alphanumeric, dot, underscore, dash
    filename = re.sub(r'[^a-zA-Z0-9.\-_]', '_', filename)
    return filename.strip('_')
