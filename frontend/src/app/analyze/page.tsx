'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PresetSelector } from '@/components/preset-selector';
import { AudioRecorder } from '@/components/audio-recorder';
import { TranscriptEditor } from '@/components/transcript-editor';
import { AnalysisStatus } from '@/components/analysis-status';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/hooks/use-analysis';
import { apiClient } from '@/lib/api-client';
import { getSettings } from '@/lib/settings';
import Link from 'next/link';
import { Check, ChevronLeft, ArrowRight, Volume2, Sparkles, AlertCircle, Zap, Settings as SettingsIcon } from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<string>('meeting');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFilename, setAudioFilename] = useState<string>('เสียงที่เลือก');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Load preferences from Settings
  React.useEffect(() => {
    const s = getSettings();
    if (s.defaultPreset) setSelectedPreset(s.defaultPreset);
    if (typeof s.autoSaveOnStop === 'boolean') setAutoSaveEnabled(s.autoSaveOnStop);
  }, []);

  
  // STT state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttNotice, setSttNotice] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  
  // Analysis hook
  const { status, result, error, startAnalysis, reset: resetAnalysis } = useAnalysis();

  const handleAudioReady = useCallback((blob: Blob, filename?: string) => {
    setAudioBlob(blob);
    if (filename) {
      setAudioFilename(filename);
    }
  }, []);

  // Automatic immediate submission to history when speech is finished
  const handleAutoSubmit = useCallback((blob: Blob, filename?: string) => {
    setAudioBlob(blob);
    if (filename) {
      setAudioFilename(filename);
    }
    // Instantly queue in DB & start analysis
    startAnalysis(blob, selectedPreset, transcript);
  }, [selectedPreset, transcript, startAnalysis]);

  const handleProceedToStep3 = async () => {
    if (!audioBlob) return;
    setStep(3);

    // If transcript is already filled by user, don't overwrite
    if (transcript.trim()) return;

    // Attempt automatic STT in the background
    setIsTranscribing(true);
    setSttNotice(null);
    try {
      const res = await apiClient.transcribeAudio(audioBlob);
      if (res && res.transcript) {
        setTranscript(res.transcript);
      } else {
        setSttNotice('ถอดเสียงไม่สำเร็จ สามารถพิมพ์เนื้อหาเองหรือกดวิเคราะห์เสียงได้ทันที');
      }
    } catch (err: any) {
      console.warn('Transcription service error:', err);
      const errDetail = err?.message || '';
      if (errDetail.includes('400') || errDetail.includes('not configured')) {
        setSttNotice('ระบบถอดเสียงอัตโนมัติ (STT) ยังไม่ได้เปิดใช้งานคีย์ API — กรุณาตรวจสอบว่าได้ระบุ OpenAI API Key ในหน้าตั้งค่าแล้ว');
      } else {
        setSttNotice(`การถอดเสียงล้มเหลว: ${errDetail || 'เกิดข้อผิดพลาดในการประมวลผลเสียง'} — คุณสามารถพิมพ์เนื้อหาที่พูดลงในช่องด้านล่าง หรือกดเริ่มวิเคราะห์ได้ทันที`);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!audioBlob || !selectedPreset) return;
    startAnalysis(audioBlob, selectedPreset, transcript);
  };

  // If analysis is complete, redirect to results page
  React.useEffect(() => {
    if (status === 'completed' && result) {
      router.push(`/results/${result.id}`);
    }
  }, [status, result, router]);

  // View: Processing Analysis
  if (status !== 'idle' && status !== 'failed') {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <AnalysisStatus 
          status={status} 
          onRetry={() => {
            resetAnalysis();
            handleStartAnalysis();
          }}
        />
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <AnalysisStatus 
          status={status} 
          error={error} 
          onRetry={() => {
            resetAnalysis();
            handleStartAnalysis();
          }} 
        />
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => {
            resetAnalysis();
            setStep(1);
            setAudioBlob(null);
            setTranscript('');
          }}>
            เริ่มใหม่ทั้งหมด
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* Progress Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                step > s ? 'bg-blue-600 text-white' : 
                step === s ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              <span className={`mt-2 text-xs font-semibold ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                {s === 1 ? '1. เลือกประเภท' : s === 2 ? '2. บันทึกเสียง' : '3. ตรวจสอบเนื้อหา'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        
        {/* Step 1: Preset Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">1. เลือกประเภทการพูด</h2>
              <p className="text-gray-500 mt-2">เลือกสถานการณ์ที่คุณต้องการฝึกซ้อม เพื่อให้เกณฑ์การประเมินตรงจุดที่สุด</p>
            </div>
            
            <PresetSelector 
              selectedKey={selectedPreset} 
              onSelect={setSelectedPreset} 
            />
            
            <div className="mt-10 flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedPreset}
                className="w-full md:w-auto px-8 h-12 rounded-xl text-base shadow-md"
              >
                ถัดไป: บันทึกเสียง <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Audio Recording / Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">2. บันทึกเสียงลงไมโครโฟน</h2>
              <p className="text-gray-500 mt-2">พูดใส่ไมค์อย่างเป็นธรรมชาติ ระบบจะบันทึกประวัติและเริ่มวิเคราะห์ให้อัตโนมัติ</p>
            </div>

            {/* Quick Auto-Save Mode Toggle */}
            <div className="flex items-center justify-center mb-4">
              <button 
                type="button"
                onClick={() => setAutoSaveEnabled(prev => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  autoSaveEnabled 
                    ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' 
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${autoSaveEnabled ? 'text-blue-600 fill-current' : 'text-gray-400'}`} />
                <span>โหมดบันทึกอัตโนมัติทันทีที่พูดจบ: {autoSaveEnabled ? 'เปิดใช้งาน (แนะนำ)' : 'ปิด (ตรวจทานก่อน)'}</span>
              </button>
            </div>
            
            <AudioRecorder 
              onAudioReady={handleAudioReady} 
              onAutoSubmit={autoSaveEnabled ? handleAutoSubmit : undefined}
              autoSave={autoSaveEnabled}
              initialAudio={audioBlob} 
            />
            
            <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-6">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-1.5" /> ย้อนกลับ
              </Button>
              <Button 
                onClick={handleProceedToStep3}
                disabled={!audioBlob}
                className="px-8 h-12 rounded-xl text-base shadow-md"
              >
                ถัดไป: ตรวจสอบข้อความ <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Transcript Review & Start Analysis */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">3. ตรวจสอบเนื้อหาการพูด</h2>
              <p className="text-gray-500 mt-2">ตรวจสอบและแก้ไขข้อความ เพื่อความแม่นยำในการวิเคราะห์เนื้อหาและคำฟุ่มเฟือย</p>
            </div>

            {/* Audio Info Card */}
            <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">{audioFilename}</p>
                  <p className="text-xs text-blue-600">
                    ขนาด: {audioBlob ? (audioBlob.size / (1024 * 1024)).toFixed(2) : 0} MB • พร้อมวิเคราะห์
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs text-blue-700">
                เปลี่ยนเสียง
              </Button>
            </div>

            {/* STT Notice with 1-Click Retry and Settings Action */}
            {sttNotice && (
              <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-950 text-sm">การถอดเสียงอัตโนมัติ (STT)</p>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      {sttNotice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => {
                      setTranscript('');
                      handleProceedToStep3();
                    }}
                    disabled={isTranscribing || !audioBlob}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs"
                  >
                    🔄 ลองถอดเสียงอีกครั้ง
                  </Button>
                  <Link href="/settings">
                    <Button size="sm" variant="outline" className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs shadow-2xs">
                      <SettingsIcon className="w-3.5 h-3.5 mr-1 text-amber-700" />
                      ตั้งค่า
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {isTranscribing ? (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 max-w-3xl mx-auto">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-gray-900">กำลังถอดเสียงพูดด้วย AI...</h3>
                <p className="text-sm text-gray-500 mt-1">กำลังแปลงเสียงเป็นข้อความภาษาไทย กรุณารอสักครู่</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                <TranscriptEditor 
                  initialTranscript={transcript} 
                  onSave={setTranscript} 
                />
                <p className="text-xs text-gray-400">
                  💡 หากไม่มีข้อความ ระบบจะทำการวิเคราะห์จังหวะการพูด ความเร็ว และพลังเสียงจากไฟล์เสียงโดยตรง
                </p>
              </div>
            )}

            <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-6">
              <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-1.5" /> ย้อนกลับ
              </Button>
              <Button 
                size="lg" 
                onClick={handleStartAnalysis} 
                disabled={isTranscribing || !audioBlob}
                className="px-8 h-12 rounded-xl text-base shadow-lg bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                เริ่มวิเคราะห์การพูด
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
