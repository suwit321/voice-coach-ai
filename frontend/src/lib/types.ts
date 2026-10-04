export interface PresetConfig {
  key: string;
  name: string;
  icon: string;
  goal: string;
  description: string;
  dimensions: { key: string; label: string; weight: number }[];
  target_wpm_min: number;
  target_wpm_max: number;
  checklist: string[];
  enabled: boolean;
}

export interface DimensionScore {
  key: string;
  label: string;
  score: number;
  reason: string;
}

export interface Priority {
  title: string;
  evidence: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  exercise: string;
}

export interface ContentRewrite {
  original: string;
  improved: string;
  reason: string;
}

export interface ContentCoherence {
  clarity_level: string;
  structure_flow: string;
  circular_analysis: string;
  coherence_score: number;
  details?: string[];
}

export interface AudioMetrics {
  duration_sec: number;
  wpm: number;
  filler_count: number;
  filler_words: { word: string; count: number }[];
  pause_count: number;
  avg_pause_duration: number;
  total_pause_duration: number;
  energy_mean: number;
  energy_std: number;
  pitch_mean: number;
  pitch_std: number;
  speech_ratio: number;
  timeline_labels?: string[];
  energy_series?: number[];
  pitch_series?: number[];
  pitch_feedback?: string[];
  energy_feedback?: string[];
}

export interface RadarData {
  labels: string[];
  values: number[];
}

export interface Feedback {
  overall_score: number;
  dimension_scores: DimensionScore[];
  strengths: string[];
  priorities: Priority[];
  content_rewrites: ContentRewrite[];
  practice_plan: string[];
  limitations: string[];
  content_coherence?: ContentCoherence;
}

export interface SpeechSegment {
  id: number;
  start: number;
  end: number;
  duration: number;
  text: string;
  wpm: number;
  pace: string;
}

export interface PauseItem {
  start_sec: number;
  duration_sec: number;
  is_long: boolean;
}

export interface AnalysisResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  preset: { key: string; name: string };
  overall_score: number;
  radar: RadarData;
  metrics: AudioMetrics;
  feedback: Feedback | null;
  transcript: string;
  audio_url?: string;
  word_tokens?: { index: number; text: string; type: 'normal' | 'filler' | 'step' | 'circular' | 'repeated'; note?: string }[];
  segments?: SpeechSegment[];
  pauses?: PauseItem[];
  error_message?: string;
}

export interface AnalysisListItem {
  id: string;
  created_at: string;
  preset_key: string;
  preset_name: string;
  overall_score: number;
  status: string;
}
