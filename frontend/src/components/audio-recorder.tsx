'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Mic, Square, Upload, RefreshCw, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { formatDuration } from '@/lib/utils';
import { Button } from './ui/button';

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, filename?: string) => void;
  onAutoSubmit?: (blob: Blob, filename?: string) => void;
  autoSave?: boolean;
  initialAudio?: Blob | null;
}

export function AudioRecorder({ onAudioReady, onAutoSubmit, autoSave = true, initialAudio }: AudioRecorderProps) {
  const {
    isRecording,
    state,
    audioBlob: recordedBlob,
    audioUrl: recordedUrl,
    duration,
    error: recordError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(initialAudio || null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Active audio is either recorded or uploaded
  const activeBlob = recordedBlob || uploadedBlob;
  const activeUrl = recordedUrl || uploadedUrl;

  // Handle uploaded file audio URL cleanup
  useEffect(() => {
    return () => {
      if (uploadedUrl) {
        URL.revokeObjectURL(uploadedUrl);
      }
    };
  }, [uploadedUrl]);

  // When recorded audio arrives, pass it to parent and auto-submit if enabled
  useEffect(() => {
    if (recordedBlob) {
      setUploadedBlob(null);
      if (uploadedUrl) {
        URL.revokeObjectURL(uploadedUrl);
        setUploadedUrl(null);
      }
      setUploadedFilename('การบันทึกเสียงสด');
      onAudioReady(recordedBlob, 'recording.webm');

      // Auto submit to history immediately if autoSave is enabled
      if (autoSave && onAutoSubmit) {
        setIsAutoSaving(true);
        onAutoSubmit(recordedBlob, 'recording.webm');
      }
    }
  }, [recordedBlob, onAudioReady, onAutoSubmit, autoSave]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|webm|ogg|aac)$/i)) {
      setLocalError('กรุณาเลือกไฟล์เสียงที่ถูกต้อง (.mp3, .wav, .m4a, .webm, .aac)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setLocalError('ขนาดไฟล์ต้องไม่เกิน 100 MB');
      return;
    }

    // Reset any previous record state
    resetRecording();

    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
    }

    const newUrl = URL.createObjectURL(file);
    setUploadedBlob(file);
    setUploadedUrl(newUrl);
    setUploadedFilename(file.name);
    onAudioReady(file, file.name);
  };

  const handleReset = () => {
    resetRecording();
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(null);
    }
    setUploadedBlob(null);
    setUploadedFilename('');
    setLocalError(null);
    setIsAutoSaving(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = localError || recordError;

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/80 w-full max-w-lg mx-auto transition-all">
      {displayError && (
        <div className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-medium">เกิดข้อผิดพลาด</p>
            <p className="text-xs text-red-600 mt-0.5">{displayError}</p>
          </div>
        </div>
      )}

      {/* Auto-Save Indicator Badge */}
      <div className="mb-6 inline-flex items-center space-x-2 text-xs font-semibold text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>บันทึกประวัติและวิเคราะห์อัตโนมัติทันทีที่พูดจบ</span>
      </div>

      {/* State 1: Idle (Show record & upload buttons) */}
      {!isRecording && !activeBlob && (
        <div className="flex flex-col items-center space-y-6 w-full text-center">
          <button
            onClick={startRecording}
            className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-xl hover:shadow-blue-200"
            title="กดเพื่อเริ่มบันทึกเสียง"
          >
            <Mic className="w-12 h-12" />
          </button>

          <div>
            <h3 className="text-xl font-bold text-gray-900">กดเพื่อเริ่มพูดลงไมโครโฟน</h3>
            <p className="text-sm text-gray-500 mt-1">
              ระบบจะบันทึกประวัติการพูดและเริ่มต้นวิเคราะห์ให้โดยอัตโนมัติทันทีที่คุณพูดจบ
            </p>
          </div>

          <div className="flex items-center w-full max-w-xs">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">หรือ</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xs h-11 rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            อัปโหลดไฟล์เสียงที่มีอยู่
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*,.mp3,.wav,.m4a,.webm,.aac,.ogg"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* State 2: Actively Recording */}
      {isRecording && (
        <div className="flex flex-col items-center space-y-6 w-full text-center py-4">
          <div className="relative flex items-center justify-center w-36 h-36">
            <div className="absolute inset-0 bg-red-200/60 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-red-100 rounded-full animate-pulse"></div>
            <button
              onClick={stopRecording}
              className="relative z-10 w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all shadow-2xl"
              title="กดเพื่อหยุดบันทึกและบันทึกประวัติทันที"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
          </div>

          <div>
            <div className="text-4xl font-mono font-bold text-gray-900 tracking-wider">
              {formatDuration(duration)}
            </div>
            <p className="text-sm text-red-600 font-medium mt-2 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2 animate-pulse"></span>
              กำลังฟังเสียงพูดของคุณ... กดปุ่มสีแดงเมื่อพูดจบ
            </p>
          </div>
        </div>
      )}

      {/* State 3: Audio Ready (Recorded or Uploaded) */}
      {!isRecording && activeBlob && activeUrl && (
        <div className="w-full space-y-5 flex flex-col items-center">
          <div className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center font-semibold text-green-700">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                {isAutoSaving ? 'กำลังส่งบันทึกประวัติและวิเคราะห์...' : 'นำเข้าเสียงเรียบร้อยแล้ว'}
              </span>
              <span className="text-xs text-gray-400 truncate max-w-[180px]">
                {uploadedFilename || 'เสียงที่บันทึก'}
              </span>
            </div>

            <div className="bg-gray-50 p-2 rounded-xl flex items-center">
              <audio
                controls
                src={activeUrl}
                className="w-full h-11 outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>ขนาดไฟล์: {(activeBlob.size / (1024 * 1024)).toFixed(2)} MB</span>
              {duration > 0 && <span>ความยาว: {formatDuration(duration)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              บันทึกหรือเลือกใหม่
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">
        🔒 ประวัติการพูดและผลวิเคราะห์จะถูกบันทึกไว้ในบัญชีของคุณเพื่อให้คุณติดตามพัฒนาการได้ตลอดเวลา
      </p>
    </div>
  );
}
