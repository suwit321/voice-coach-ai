'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { PresetConfig } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Loader2 } from 'lucide-react';

const FALLBACK_PRESETS: PresetConfig[] = [
  {
    key: 'meeting',
    name: 'การประชุม/รายงาน',
    icon: 'Building2',
    goal: 'ชัด กระชับ เป็นทางการ',
    description: 'วิเคราะห์การรายงานในที่ประชุม เน้นความกระชับ ข้อมูลครบถ้วน และมี action items',
    dimensions: [
      { key: 'conciseness', label: 'ความกระชับ', weight: 0.20 },
      { key: 'completeness', label: 'ข้อมูลครบ', weight: 0.25 },
      { key: 'formality', label: 'ความเป็นทางการ', weight: 0.20 },
      { key: 'structure', label: 'โครงสร้าง', weight: 0.20 },
      { key: 'filler_control', label: 'ควบคุมคำฟุ่มเฟือย', weight: 0.15 },
    ],
    target_wpm_min: 100,
    target_wpm_max: 140,
    checklist: ['เปิดด้วยวัตถุประสงค์ที่ชัดเจน', 'มีข้อมูลสนับสนุน/ตัวเลข', 'สรุปประเด็นและ action items'],
    enabled: true,
  },
  {
    key: 'public_speaking',
    name: 'พูดต่อหน้าชุมชน',
    icon: 'Mic2',
    goal: 'ดึงดูดและน่าจดจำ',
    description: 'วิเคราะห์การพูดต่อสาธารณะ เน้นพลังเสียง การดึงดูดความสนใจ และการทิ้งท้าย',
    dimensions: [
      { key: 'energy', label: 'พลังเสียง', weight: 0.25 },
      { key: 'hook', label: 'เปิดดึงดูด', weight: 0.20 },
      { key: 'storytelling', label: 'เรื่องเล่า/ตัวอย่าง', weight: 0.20 },
      { key: 'engagement', label: 'การมีส่วนร่วม', weight: 0.15 },
      { key: 'conclusion', label: 'ทิ้งท้ายชัด', weight: 0.20 },
    ],
    target_wpm_min: 120,
    target_wpm_max: 160,
    checklist: ['เปิดด้วย hook ที่ดึงดูดความสนใจ', 'มีเรื่องเล่าหรือตัวอย่างประกอบ', 'ชวนผู้ฟังมีส่วนร่วม', 'ทิ้งท้ายด้วย call to action ที่ชัดเจน'],
    enabled: true,
  },
  {
    key: 'mc',
    name: 'พิธีกร',
    icon: 'Sparkles',
    goal: 'คุม flow และบรรยากาศ',
    description: 'วิเคราะห์การดำเนินรายการ เน้นความลื่นไหล การคุมเวลา และพลังเสียงสม่ำเสมอ',
    dimensions: [
      { key: 'flow', label: 'ความลื่นไหล', weight: 0.25 },
      { key: 'timing', label: 'คุมเวลา', weight: 0.15 },
      { key: 'consistent_energy', label: 'พลังสม่ำเสมอ', weight: 0.25 },
      { key: 'transitions', label: 'คำเชื่อม', weight: 0.15 },
      { key: 'audience_pull', label: 'ดึงผู้ฟัง', weight: 0.20 },
    ],
    target_wpm_min: 130,
    target_wpm_max: 170,
    checklist: ['ใช้คำเชื่อมเปลี่ยนช่วงอย่างราบรื่น', 'คุมเวลาแต่ละช่วงได้ดี', 'รักษาพลังเสียงสม่ำเสมอตลอดรายการ', 'กู้สถานการณ์ได้เมื่อสะดุด'],
    enabled: true,
  },
];

interface PresetSelectorProps {
  onSelect: (presetKey: string) => void;
  selectedKey?: string;
}

export function PresetSelector({ onSelect, selectedKey }: PresetSelectorProps) {
  const [presets, setPresets] = useState<PresetConfig[]>(FALLBACK_PRESETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getPresets();
        if (Array.isArray(data) && data.length > 0) {
          setPresets(data);
        }
      } catch (err) {
        console.error('Failed to load presets, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const safePresets = Array.isArray(presets) && presets.length > 0 ? presets : FALLBACK_PRESETS;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {safePresets.map((preset) => {
        // Safe icon rendering
        const iconKey = preset.icon || 'FileText';
        const IconComponent = (Icons as any)[iconKey] || (Icons as any)['MessageSquare'] || Icons.FileText;

        return (
          <Card
            key={preset.key}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md border-2',
              selectedKey === preset.key
                ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/30'
                : 'border-transparent'
            )}
            onClick={() => onSelect(preset.key)}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <IconComponent className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{preset.name}</h3>
              <p className="text-sm font-medium text-blue-600 mb-3">{preset.goal}</p>
              <p className="text-sm text-gray-500 mb-4 flex-1">{preset.description}</p>

              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 block mb-2 font-medium">5 มิติที่วัดผล:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(preset.dimensions || []).map((dim) => (
                    <span
                      key={dim.key}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {dim.label}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
