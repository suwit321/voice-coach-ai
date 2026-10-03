import librosa
import numpy as np
import logging

logger = logging.getLogger(__name__)

def analyze_audio(audio_path: str) -> dict:
    """Analyze audio file and extract acoustic features.
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        dict: Acoustic metrics including duration, energy, pitch, pauses, etc.
    """
    try:
        # Load audio at 16kHz mono
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        duration_sec = float(librosa.get_duration(y=y, sr=sr))
        
        # RMS Energy (volume dynamics)
        rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
        energy_mean = float(np.mean(rms))
        energy_std = float(np.std(rms))
        
        # Pitch (F0) using PYIN - use hop_length=1024 for 2-4x speedup
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y,
            fmin=librosa.note_to_hz('C2'),   # ~65 Hz
            fmax=librosa.note_to_hz('C6'),   # ~1046 Hz
            sr=sr,
            frame_length=2048,
            hop_length=1024  # Faster than default 512
        )
        # IMPORTANT: Filter NaN values from unvoiced frames
        valid_f0 = f0[voiced_flag & ~np.isnan(f0)]
        pitch_mean = float(np.mean(valid_f0)) if len(valid_f0) > 0 else 0.0
        pitch_std = float(np.std(valid_f0)) if len(valid_f0) > 0 else 0.0
        
        # Pause detection
        non_silent = librosa.effects.split(y, top_db=25, frame_length=2048, hop_length=512)
        pauses = []
        for i in range(len(non_silent) - 1):
            pause_start = non_silent[i][1]
            pause_end = non_silent[i + 1][0]
            pause_duration = (pause_end - pause_start) / sr
            if pause_duration >= 0.3:  # Only count pauses >= 300ms
                pauses.append({
                    'start_sec': float(pause_start / sr),
                    'duration_sec': float(pause_duration),
                    'is_long': pause_duration > 2.0  # Flag pauses > 2s
                })
        
        total_pause_time = sum(p['duration_sec'] for p in pauses)
        speech_ratio = float((duration_sec - total_pause_time) / duration_sec) if duration_sec > 0 else 0.0
        
        # Return structured metrics
        return {
            'duration_sec': duration_sec,
            'energy_mean': energy_mean,
            'energy_std': energy_std,
            'pitch_mean': pitch_mean,
            'pitch_std': pitch_std,
            'pause_count': len(pauses),
            'long_pause_count': sum(1 for p in pauses if p['is_long']),
            'total_pause_duration': total_pause_time,
            'avg_pause_duration': total_pause_time / len(pauses) if pauses else 0.0,
            'speech_ratio': speech_ratio,
            'pauses': pauses,
        }
    except Exception as e:
        logger.error(f"Error analyzing audio {audio_path}: {e}")
        raise e
