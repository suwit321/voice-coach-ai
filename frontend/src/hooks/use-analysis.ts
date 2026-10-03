import { useState, useCallback, useRef } from 'react';
import { apiClient } from '../lib/api-client';
import { AnalysisResponse } from '../lib/types';

export type AnalysisStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export function useAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const pollStatus = useCallback(async (id: string) => {
    try {
      const data = await apiClient.getAnalysis(id);
      setResult(data);

      if (data.status === 'completed') {
        setStatus('completed');
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      } else if (data.status === 'failed') {
        setStatus('failed');
        setError(data.error_message || 'Analysis failed');
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }
    } catch (err: any) {
      console.error('Poll error:', err);
      // Keep polling on temporary network errors
    }
  }, []);

  const startAnalysis = useCallback(async (audioBlob: Blob, preset: string, transcript?: string) => {
    setStatus('uploading');
    setError(null);
    setResult(null);

    try {
      const { id } = await apiClient.createAnalysis(audioBlob, preset, transcript);
      setStatus('processing');
      
      pollTimerRef.current = setInterval(() => pollStatus(id), 2000);
      pollStatus(id); // initial poll
    } catch (err: any) {
      console.error('Analysis start error:', err);
      setStatus('failed');
      setError(err.message || 'Failed to start analysis');
    }
  }, [pollStatus]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
  }, []);

  return {
    status,
    result,
    error,
    startAnalysis,
    reset
  };
}
