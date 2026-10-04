'use client';

import React, { useState, useEffect } from 'react';
import { AnalysisStatus as StatusType } from '@/hooks/use-analysis';
import { CheckCircle2, Circle, Loader2, AlertCircle, Clock, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface AnalysisStatusProps {
  status: StatusType;
  error?: string | null;
  onRetry?: () => void;
}

export function AnalysisStatus({ status, error, onRetry }: AnalysisStatusProps) {
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    { key: 'uploading', label: 'อัปโหลดไฟล์เสียง' },
    { key: 'transcribing', label: 'ถอดความเสียง (Speech-to-Text)' },
    { key: 'analyzing_audio', label: 'วิเคราะห์น้ำเสียงและจังหวะ (Pitch & Energy)' },
    { key: 'analyzing_content', label: 'วิเคราะห์เนื้อหาและคำฟุ่มเฟือย' },
    { key: 'generating_feedback', label: 'สร้างคำแนะนำจาก AI Coach' },
    { key: 'completed', label: 'เสร็จสิ้น' },
  ];

  // Track elapsed time in seconds while active
  useEffect(() => {
    if (status === 'uploading' || status === 'processing') {
      const timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setElapsed(0);
    }
  }, [status]);

  // Smoothly advance visual steps as time passes to give responsive feedback
  const getStepIndex = () => {
    if (status === 'idle') return -1;
    if (status === 'uploading') return 0;
    if (status === 'completed') return 5;
    if (status === 'processing') {
      if (elapsed < 3) return 1;        // Transcribing
      if (elapsed < 8) return 2;        // Audio acoustic analysis
      if (elapsed < 14) return 3;       // Content analysis
      return 4;                         // AI Coach feedback generation
    }
    return -1;
  };

  const currentIndex = getStepIndex();

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-2xl border border-red-200 max-w-md mx-auto w-full shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-red-900 mb-2">เกิดข้อผิดพลาดในการประมวลผล</h3>
        <p className="text-sm text-red-700 mb-6 bg-white/70 p-3 rounded-xl border border-red-100 font-mono text-left max-h-36 overflow-y-auto">
          {error || 'ไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="danger" className="rounded-xl px-6">
            <RefreshCw className="w-4 h-4 mr-2" /> ลองใหม่อีกครั้ง
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-md border border-gray-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mb-3 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">กำลังวิเคราะห์เสียงพูดของคุณ</h3>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>เวลาที่ใช้: {elapsed} วินาที</span>
        </div>
      </div>
      
      <div className="space-y-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || status === 'completed';
          const isCurrent = idx === currentIndex && status !== 'completed';
          
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    isCompleted ? 'text-gray-700 font-medium' : 
                    isCurrent ? 'text-blue-700 font-bold' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-2xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md animate-pulse">
                      กำลังดำเนินการ
                    </span>
                  )}
                </div>
                {isCurrent && (
                  <div className="mt-2 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite]"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful reassurance cards during longer processing */}
      {elapsed >= 15 && (
        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-start gap-3 animate-in fade-in duration-300">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">ระบบกำลังวิเคราะห์มิติต่างๆ อย่างละเอียด</p>
            <p className="text-amber-700 leading-relaxed">
              บนเซิร์ฟเวอร์ฟรี (Render Free Tier) ระบบอาจใช้เวลา 15-35 วินาทีในการสกัดคลื่นเสียงและคำนวณคะแนน กรุณารอสักครู่นะครับ
            </p>
          </div>
        </div>
      )}

      {/* Fallback button if waiting longer than 45 seconds */}
      {elapsed >= 45 && onRetry && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">หากรอนานเกินไป คุณสามารถกดลองเชื่อมต่อใหม่อีกครั้ง</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="rounded-xl text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> ลองส่งประมวลผลใหม่อีกครั้ง
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-400 text-center mt-6">
        🔒 ระบบเข้ารหัสและรักษาความปลอดภัยข้อมูลเสียงของคุณตามมาตรฐานความเป็นส่วนตัว
      </p>
    </div>
  );
}
