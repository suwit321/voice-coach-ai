'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AudioMetrics } from '@/lib/types';
import { Zap, Volume2, TrendingUp, HelpCircle, CheckCircle2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PitchEnergyChartProps {
  metrics: AudioMetrics;
}

export function PitchEnergyChart({ metrics }: PitchEnergyChartProps) {
  const [activeMetric, setActiveMetric] = useState<'both' | 'pitch' | 'energy'>('both');

  const labels = metrics.timeline_labels && metrics.timeline_labels.length > 0
    ? metrics.timeline_labels
    : Array.from({ length: 20 }, (_, i) => `${i * 2}s`);

  // Pitch Curve (Hz)
  const pitchData = metrics.pitch_series && metrics.pitch_series.length > 0
    ? metrics.pitch_series
    : labels.map(() => Math.round(metrics.pitch_mean || 160));

  // Energy Curve (0 - 100 %)
  const energyData = metrics.energy_series && metrics.energy_series.length > 0
    ? metrics.energy_series
    : labels.map(() => Math.round((metrics.energy_mean || 0.05) * 500));

  const datasets = [];

  if (activeMetric === 'both' || activeMetric === 'pitch') {
    datasets.push({
      label: 'ระดับเสียงสูง-ต่ำ (Pitch F0 ในหน่วย Hz)',
      data: pitchData,
      borderColor: 'rgba(99, 102, 241, 1)', // Indigo
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 6,
      fill: activeMetric === 'pitch',
      yAxisID: 'yPitch',
    });
  }

  if (activeMetric === 'both' || activeMetric === 'energy') {
    datasets.push({
      label: 'พลังและความดังของเสียง (Energy Volume %)',
      data: energyData,
      borderColor: 'rgba(234, 88, 12, 1)', // Orange/Amber
      backgroundColor: 'rgba(234, 88, 12, 0.15)',
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 6,
      fill: activeMetric === 'energy',
      yAxisID: activeMetric === 'both' ? 'yEnergy' : 'yPitch',
    });
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { family: 'Noto Sans Thai, sans-serif', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 10,
        titleFont: { family: 'Noto Sans Thai, sans-serif', size: 12 },
        bodyFont: { family: 'Noto Sans Thai, sans-serif', size: 11 },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label.includes('Pitch')) {
              return ` 🎵 ระดับเสียง: ${context.parsed.y} Hz`;
            }
            if (label.includes('Energy')) {
              return ` ⚡ พลังเสียง: ${context.parsed.y}%`;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(241, 245, 249, 1)' },
        ticks: { font: { size: 10 } },
      },
      yPitch: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: activeMetric === 'energy' ? 'พลังเสียง (%)' : 'ระดับเสียง (Hz)',
          font: { size: 11, weight: 'bold' as const },
        },
        grid: { color: 'rgba(241, 245, 249, 1)' },
      },
      ...(activeMetric === 'both'
        ? {
            yEnergy: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              min: 0,
              max: 100,
              title: {
                display: true,
                text: 'พลังเสียง (%)',
                font: { size: 11, weight: 'bold' as const },
              },
              grid: { drawOnChartArea: false },
            },
          }
        : {}),
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      
      {/* Header & Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-500" />
            กราฟวิเคราะห์พลังเสียง และระดับเสียงสูง-ต่ำ (Pitch & Dynamics)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            ดูความแปรผันของคีย์เสียง (Hz) เทียบกับพลังความดังตลอดการพูด
          </p>
        </div>

        {/* Filter Tab Buttons */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMetric('both')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'both' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            แสดงคู่กัน
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('pitch')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'pitch' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            🎵 เสียงสูง-ต่ำ
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('energy')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === 'energy' ? 'bg-white text-orange-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ⚡ พลังเสียง
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <Line data={{ labels, datasets }} options={options} />
      </div>

      {/* Acoustic Insights & Coaching Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        
        {/* Pitch Coaching Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-600" />
              ข้อเสนอแนะระดับเสียงสูง-ต่ำ (Pitch)
            </span>
            <span className="text-xs font-mono font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
              เฉลี่ย {Math.round(metrics.pitch_mean || 0)} Hz
            </span>
          </div>
          
          <ul className="text-xs text-indigo-950 space-y-1.5 pt-1">
            {metrics.pitch_feedback && metrics.pitch_feedback.length > 0 ? (
              metrics.pitch_feedback.map((f, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>ระดับเสียงพูดมีชีวิตชีวาพอเหมาะ มีการขึ้นลงของน้ำเสียงเป็นธรรมชาติ</span>
              </li>
            )}
          </ul>
        </div>

        {/* Energy Coaching Card */}
        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-orange-950 flex items-center">
              <Volume2 className="w-4 h-4 mr-1.5 text-orange-600" />
              ข้อเสนอแนะพลังและความดังของเสียง (Energy)
            </span>
            <span className="text-xs font-mono font-semibold text-orange-800 bg-white px-2 py-0.5 rounded-md border border-orange-200">
              ความผันแปร ±{(metrics.energy_std * 100).toFixed(1)}%
            </span>
          </div>

          <ul className="text-xs text-orange-950 space-y-1.5 pt-1">
            {metrics.energy_feedback && metrics.energy_feedback.length > 0 ? (
              metrics.energy_feedback.map((f, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-orange-600 shrink-0 mt-0.5" />
                <span>พลังเสียงอยู่ในระดับมาตรฐาน มีน้ำหนักเสียงที่มั่นใจและฟังชัดเจน</span>
              </li>
            )}
          </ul>
        </div>

      </div>

    </div>
  );
}
