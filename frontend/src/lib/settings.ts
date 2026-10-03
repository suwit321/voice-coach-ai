export interface AppSettings {
  // General & Coaching Preferences
  defaultPreset: string;
  autoSaveOnStop: boolean;
  targetWpmMin: number;
  targetWpmMax: number;
  language: string;

  // AI & STT Configuration
  llmProvider: 'openai' | 'anthropic' | 'gemini';
  llmModel: string;
  llmApiKey: string;
  sttApiKey: string;
  enableAutoStt: boolean;

  // Audio Hardware & Processing
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;

  // Privacy & Retention
  retainAudio: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultPreset: 'meeting',
  autoSaveOnStop: true,
  targetWpmMin: 100,
  targetWpmMax: 150,
  language: 'th',

  llmProvider: 'openai',
  llmModel: 'gpt-4o',
  llmApiKey: '',
  sttApiKey: '',
  enableAutoStt: true,

  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,

  retainAudio: false,
};

const SETTINGS_KEY = 'voice_coach_app_settings';

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('Failed to parse settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function resetSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.error('Failed to reset settings:', err);
  }
  return DEFAULT_SETTINGS;
}
