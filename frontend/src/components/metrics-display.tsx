import React from 'react';
import { AudioMetrics } from '@/lib/types';
import { Clock, Zap, Activity, MessageSquare, PauseCircle, Timer } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface MetricsDisplayProps {
  metrics: AudioMetrics;
  targetWpmMin?: number;
  targetWpmMax?: number;
}

export function MetricsDisplay({ metrics, targetWpmMin = 100, targetWpmMax = 150 }: MetricsDisplayProps) {
  
  const getWpmStatus = (wpm: number) => {
    if (wpm < targetWpmMin) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'ช้าไปนิด' };
    if (wpm > targetWpmMax) return { color: 'text-red-600', bg: 'bg-red-100', label: 'เร็วเกินไป' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'กำลังดี' };
  };

  const getFillerStatus = (count: number, duration: number) => {
    const rate = count / (duration / 60);
    if (rate > 5) return { color: 'text-red-600', bg: 'bg-red-100', label: 'ต้องลดลง' };
    if (rate > 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'ปานกลาง' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'ยอดเยี่ยม' };
  };

  const wpmStatus = getWpmStatus(metrics.wpm);
  const fillerStatus = getFillerStatus(metrics.filler_count, metrics.duration_sec);

  const metricCards = [
    {
      label: 'ความเร็วการพูด (WPM)',
      value: Math.round(metrics.wpm),
      unit: 'คำ/นาที',
      icon: <Activity className="w-5 h-5" />,
      status: wpmStatus,
      iconColor: 'text-blue-500',
    },
    {
      label: 'ความยาวทั้งหมด',
      value: formatDuration(metrics.duration_sec),
      unit: 'นาที',
      icon: <Clock className="w-5 h-5" />,
      status: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'ข้อมูล' },
      iconColor: 'text-indigo-500',
    },
    {
      label: 'คำฟุ่มเฟือย (Filler Words)',
      value: metrics.filler_count,
      unit: 'คำ',
      icon: <MessageSquare className="w-5 h-5" />,
      status: fillerStatus,
      iconColor: 'text-orange-500',
    },
    {
      label: 'การหยุดพัก (Pauses)',
      value: metrics.pause_count,
      unit: 'ครั้ง',
      icon: <PauseCircle className="w-5 h-5" />,
      status: { color: 'text-gray-600', bg: 'bg-gray-100', label: `เฉลี่ย ${(metrics.avg_pause_duration).toFixed(1)}s` },
      iconColor: 'text-purple-500',
    },
    {
      label: 'ระดับพลังงานเสียง',
      value: metrics.energy_mean.toFixed(1),
      unit: 'dB (โดยประมาณ)',
      icon: <Zap className="w-5 h-5" />,
      status: { color: 'text-gray-600', bg: 'bg-gray-100', label: `SD: ${metrics.energy_std.toFixed(1)}` },
      iconColor: 'text-yellow-500',
    },
    {
      label: 'สัดส่วนการพูด',
      value: (metrics.speech_ratio * 100).toFixed(0),
      unit: '%',
      icon: <Timer className="w-5 h-5" />,
      status: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'เวลาพูดเทียบเวลาพัก' },
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metricCards.map((card, idx) => (
        <Card key={idx} className="border border-gray-100 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-gray-50 ${card.iconColor}`}>
                {card.icon}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${card.status.bg} ${card.status.color}`}>
                {card.status.label}
              </span>
            </div>
            
            <div className="mt-auto">
              <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                <span className="text-xs text-gray-500 font-medium">{card.unit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
