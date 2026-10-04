import { AnalysisResponse, AnalysisListItem, PresetConfig } from './types';
import { getSettings } from './settings';

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const s = getSettings();
    if (s.apiUrl && s.apiUrl.trim()) {
      return s.apiUrl.trim().replace(/\/+$/, '');
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('voice-coach-session-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('voice-coach-session-id', id);
  }
  return id;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('X-Session-ID', getSessionId());

  // Inject user custom settings headers if configured in frontend
  const settings = getSettings();
  if (settings.llmApiKey) {
    headers.set('X-LLM-API-Key', settings.llmApiKey);
    headers.set('X-LLM-Provider', settings.llmProvider);
    if (settings.llmModel) {
      headers.set('X-LLM-Model', settings.llmModel);
    }
  }
  if (settings.sttApiKey) {
    headers.set('X-STT-API-Key', settings.sttApiKey);
  } else if (settings.llmApiKey && settings.llmProvider === 'openai') {
    // If OpenAI key is set, can also use for Whisper
    headers.set('X-STT-API-Key', settings.llmApiKey);
  }

  const apiBase = getApiBase();
  let response: Response;
  try {
    response = await fetch(`${apiBase}${url}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    console.error('Fetch error connecting to:', `${apiBase}${url}`, netErr);
    throw new Error(
      `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้ (${apiBase}) ` +
      `กรุณาตรวจสอบว่า Backend เปิดทำงานอยู่หรือไม่ หรือไปที่หน้า 'ตั้งค่า' เพื่อระบุ Backend Server URL ให้ถูกต้อง`
    );
  }

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(`API error (${response.status}): ${errorDetail}`);
  }

  return response;
}

export const apiClient = {
  async getPresets(): Promise<PresetConfig[]> {
    try {
      const res = await fetchWithAuth('/api/v1/presets');
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.presets)) return data.presets;
      return [];
    } catch (err) {
      console.warn('Failed to fetch presets from API, using fallback defaults:', err);
      return [];
    }
  },

  async createAnalysis(audioBlob: Blob, preset: string, transcript?: string): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    formData.append('preset', preset);
    if (transcript) {
      formData.append('transcript', transcript);
    }

    const res = await fetchWithAuth('/api/v1/analyses', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async getAnalysis(id: string): Promise<AnalysisResponse> {
    const res = await fetchWithAuth(`/api/v1/analyses/${id}`);
    return res.json();
  },

  async getAnalysisList(): Promise<AnalysisListItem[]> {
    try {
      const res = await fetchWithAuth('/api/v1/analyses');
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    } catch (err) {
      console.warn('Failed to fetch analysis list:', err);
      return [];
    }
  },

  async deleteAnalysis(id: string): Promise<void> {
    await fetchWithAuth(`/api/v1/analyses/${id}`, { method: 'DELETE' });
  },

  async exportAnalysis(id: string, format: 'md' | 'json'): Promise<Blob> {
    const res = await fetchWithAuth(`/api/v1/analyses/${id}/export?format=${format}`);
    return res.blob();
  },

  async rateAnalysis(id: string, rating: 1 | -1): Promise<void> {
    await fetchWithAuth(`/api/v1/analyses/${id}/feedback?rating=${rating}`, {
      method: 'PATCH',
    });
  },

  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');

    const res = await fetchWithAuth('/api/v1/transcriptions', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async purgeAllSessionData(): Promise<{ message: string; deleted_analyses: number; deleted_audio_files: number }> {
    const res = await fetchWithAuth('/api/v1/analyses/session/purge-all', {
      method: 'DELETE',
    });
    return res.json();
  }
};
