import subprocess
import os
import logging
import wave
import contextlib

logger = logging.getLogger(__name__)

def convert_to_wav(input_path: str, output_path: str) -> str:
    """Convert audio format to 16kHz mono WAV using FFmpeg subprocess, with graceful fallback."""
    if input_path.lower().endswith('.wav'):
        return input_path

    try:
        command = [
            'ffmpeg', '-y', '-i', input_path,
            '-ar', '16000', '-ac', '1',
            output_path
        ]
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return output_path
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        logger.warning(f"FFmpeg conversion skipped/failed ({e}). Using original file: {input_path}")
        return input_path


def get_audio_duration(file_path: str) -> float:
    """Get duration without loading entire file."""
    try:
        if file_path.endswith('.wav'):
            with contextlib.closing(wave.open(file_path, 'r')) as f:
                frames = f.getnframes()
                rate = f.getframerate()
                duration = frames / float(rate)
                return duration
        else:
            # Fallback to ffprobe if available
            command = [
                'ffprobe', '-v', 'error', '-show_entries',
                'format=duration', '-of',
                'default=noprint_wrappers=1:nokey=1', file_path
            ]
            result = subprocess.run(command, capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
    except Exception as e:
        logger.warning(f"Could not get precise duration: {e}")
        return 0.0

def validate_audio_file(file_path: str) -> bool:
    """Check if file is valid audio."""
    if not os.path.exists(file_path):
        return False
    # Simple check based on extension or size, full validation with ffmpeg/librosa later
    return os.path.getsize(file_path) > 0
