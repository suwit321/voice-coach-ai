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
        
        # Pitch (F0) using fast downsampled YIN (~10x faster than PYIN, highly accurate for speech)
        # Speech fundamental frequency is 65-400 Hz, so 4000 Hz sampling rate is ideal
        pitch_sr = 4000
        decimation = max(1, sr // pitch_sr)
        y_pitch = y[::decimation]
        eff_pitch_sr = sr // decimation
        
        # Limit pitch analysis to first 90 seconds if audio is long to prevent CPU stalls on Render
        if len(y_pitch) > eff_pitch_sr * 90:
            y_pitch_calc = y_pitch[:eff_pitch_sr * 90]
        else:
            y_pitch_calc = y_pitch

        f0 = librosa.yin(
            y_pitch_calc,
            fmin=65,
            fmax=400,
            sr=eff_pitch_sr,
            frame_length=512,
            hop_length=256,
            trough_threshold=0.15
        )
        
        # Detect voiced vs silence using RMS of pitch signal
        rms_pitch = librosa.feature.rms(y=y_pitch_calc, frame_length=512, hop_length=256)[0]
        silence_thresh = max(0.01, float(np.mean(rms_pitch)) * 0.25)
        min_len = min(len(f0), len(rms_pitch))
        voiced_mask = (rms_pitch[:min_len] > silence_thresh) & (f0[:min_len] > 68) & (f0[:min_len] < 390)
        
        valid_f0 = f0[:min_len][voiced_mask]
        pitch_mean = float(np.mean(valid_f0)) if len(valid_f0) > 0 else 0.0
        pitch_std = float(np.std(valid_f0)) if len(valid_f0) > 0 else 0.0
        
        # Pause detection
        non_silent = librosa.effects.split(y, top_db=25, frame_length=2048, hop_length=1024)
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
        
        # Sample ~30-40 points for visual energy & pitch timeline charts
        num_samples = min(35, max(10, int(duration_sec)))
        time_points = np.linspace(0, duration_sec, num_samples)
        
        # Resample RMS Energy (0 - 100 scaled)
        rms_norm = (rms / (np.max(rms) + 1e-6)) * 100.0
        energy_series = []
        hop_time = 512 / sr
        for t in time_points:
            idx = min(len(rms_norm) - 1, int(t / hop_time))
            energy_series.append(round(float(rms_norm[idx]), 1))
            
        # Resample Pitch F0 (Hz)
        pitch_hop_time = 256 / eff_pitch_sr
        pitch_series = []
        for t in time_points:
            idx = min(min_len - 1, int(t / pitch_hop_time))
            is_v = bool(voiced_mask[idx]) if idx < min_len else False
            val = float(f0[idx]) if (idx < min_len and is_v) else 0.0
            pitch_series.append(round(val, 1))

        # Labels in mm:ss
        timeline_labels = [f"{int(t // 60):02d}:{int(t % 60):02d}" for t in time_points]

        # Pitch & Energy Coaching Diagnosis
        # Pitch classification
        pitch_feedback = []
        if pitch_mean > 240:
            pitch_feedback.append("ระดับเสียงพูดค่อนข้างสูง (High Pitch) อาจทำให้ผู้ฟังรู้สึกตึงเครียดหรือตื่นเต้น ลองผ่อนลมหายใจลงสู่กระบังลมเพื่อลดคีย์เสียงลง")
        elif pitch_mean < 110 and pitch_mean > 0:
            pitch_feedback.append("ระดับเสียงทุ้มต่ำลึก (Deep Pitch) ให้ความรู้สึกสุขุม แต่อย่าให้ราบเรียบเกินไปจนดูเนือย")
        else:
            pitch_feedback.append("ระดับเสียงพื้นฐานอยู่ในเกณฑ์มาตรฐานที่ฟังแล้วเป็นธรรมชาติ สบายหู")

        if pitch_std < 15:
            pitch_feedback.append("เสียงค่อนข้างราบเรียบเป็นโทนเดียว (Monotone) ขาดลูกเล่น แนะนำให้เพิ่มการยกเสียงสูงช่วงท้ายคำถาม หรือเน้นเสียงหนัก-เบาในคำสำคัญ")
        elif pitch_std > 40:
            pitch_feedback.append("มีระดับเสียงสูงต่ำที่หลากหลายมาก (Dynamic Pitch) ดึงดูดความสนใจได้ดี แต่ระวังอย่าให้แกว่งเกินไปจนดูไม่มั่นคง")
        else:
            pitch_feedback.append("การเปลี่ยนระดับเสียงสูง-ต่ำ (Pitch Variation) มีชีวิตชีวาพอเหมาะ ไม่น่าเบื่อ")

        # Energy / Volume classification
        energy_feedback = []
        if energy_mean < 0.02:
            energy_feedback.append("พลังเสียงค่อนข้างเบาหรือไมค์อยู่ห่างเกินไป อาจทำให้ผู้ฟังต้องเพ่งสมาธิ แนะนำให้พูดเปล่งเสียงให้เต็มเสียงจากท้อง")
        elif energy_mean > 0.15:
            energy_feedback.append("พลังเสียงหนักแน่น ชัดเจน แต่อาจกระแทกเสียงในบางช่วง ควบคุมไม่ให้ดังเกินความจำเป็น")
        else:
            energy_feedback.append("พลังเสียงและความดังเฉลี่ยอยู่ในระดับมาตรฐานที่ฟังชัดเจนและมั่นใจ")

        if energy_std < 0.01:
            energy_feedback.append("ระดับความดังสม่ำเสมอเกินไปจนขาดจุดเน้น (Emphasis) ลองทิ้งน้ำหนักเสียงลงบน Keyword สำคัญ")
        else:
            energy_feedback.append("มีการเน้นหนัก-เบาในแต่ละประโยคได้เป็นธรรมชาติ")

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
            'timeline_labels': timeline_labels,
            'energy_series': energy_series,
            'pitch_series': pitch_series,
            'pitch_feedback': pitch_feedback,
            'energy_feedback': energy_feedback,
        }
    except Exception as e:
        logger.error(f"Error analyzing audio {audio_path}: {e}")
        raise e
