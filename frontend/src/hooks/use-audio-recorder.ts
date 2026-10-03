import { useState, useRef, useCallback, useEffect } from 'react';

export type RecorderState = 'idle' | 'recording' | 'stopped';

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const chunksRef = useRef<BlobPart[]>([]);

  // Clean up audio object URL when replaced or unmounted
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('เบราว์เซอร์นี้ไม่รองรับการบันทึกเสียงผ่านไมโครโฟน กรุณาใช้วิธีอัปโหลดไฟล์');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Detect supported mime type
      let selectedMimeType = '';
      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
      ];
      for (const type of candidateTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      const recorderOptions: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalType = mediaRecorder.mimeType || selectedMimeType || 'audio/webm';
        const finalBlob = new Blob(chunksRef.current, { type: finalType });
        setAudioBlob(finalBlob);

        const newUrl = URL.createObjectURL(finalBlob);
        setAudioUrl(newUrl);
        setState('stopped');

        // Clean up hardware mic indicator
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250); // Collect slice every 250ms
      setState('recording');
      startTimeRef.current = Date.now();
      setDuration(0);

      timerRef.current = setInterval(() => {
        const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(currentDuration);
        if (currentDuration >= 600) { // 10 minutes max limit
          stopRecording();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('กรุณาอนุญาตสิทธิ์การใช้งานไมโครโฟนในเบราว์เซอร์ เพื่อเริ่มบันทึกเสียง');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('ไม่พบอุปกรณ์ไมโครโฟนในเครื่องของคุณ กรุณาเชื่อมต่อไมโครโฟนหรืออัปโหลดไฟล์เสียง');
      } else {
        setError(`ไม่สามารถเริ่มบันทึกเสียงได้: ${err.message || 'ข้อผิดพลาดเกี่ยวกับอุปกรณ์'}`);
      }
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setState('idle');
    setAudioBlob(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    state,
    isRecording: state === 'recording',
    audioBlob,
    audioUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
