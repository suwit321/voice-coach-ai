import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getScoreColor(score: number): string {
  if (score < 40) return 'text-red-500 bg-red-50 border-red-200';
  if (score < 60) return 'text-orange-500 bg-orange-50 border-orange-200';
  if (score < 75) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
  if (score < 90) return 'text-green-500 bg-green-50 border-green-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
}

export function getScoreLabel(score: number): string {
  if (score < 40) return 'ต้องปรับปรุง';
  if (score < 60) return 'พอใช้';
  if (score < 75) return 'ดี';
  if (score < 90) return 'ดีมาก';
  return 'ยอดเยี่ยม';
}
