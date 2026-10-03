import React from 'react';
import { AnalysisStatus as StatusType } from '@/hooks/use-analysis';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AnalysisStatusProps {
  status: StatusType;
  error?: string | null;
  onRetry?: () => void;
}

export function AnalysisStatus({ status, error, onRetry }: AnalysisStatusProps) {
  
  const steps = [
    { key: 'uploading', label: 'อัปโหลดไฟล์เสียง' },
    { key: 'transcribing', label: 'ถอดความ (Speech-to-Text)' },
    { key: 'analyzing_audio', label: 'วิเคราะห์น้ำเสียงและจังหวะ' },
    { key: 'analyzing_content', label: 'วิเคราะห์เนื้อหา' },
    { key: 'generating_feedback', label: 'สร้างคำแนะนำจาก AI Coach' },
    { key: 'completed', label: 'เสร็จสิ้น' },
  ];

  // Map simplified status to visual steps
  const getStepIndex = () => {
    if (status === 'idle') return -1;
    if (status === 'uploading') return 0;
    if (status === 'processing') return 2; // Approximated
    if (status === 'completed') return 5;
    return -1;
  };

  const currentIndex = getStepIndex();

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 max-w-md mx-auto w-full">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-red-700 mb-6">{error || 'ไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="danger">ลองใหม่อีกครั้ง</Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">กำลังวิเคราะห์ข้อมูล...</h3>
      
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || status === 'completed';
          const isCurrent = idx === currentIndex && status !== 'completed';
          const isPending = idx > currentIndex && status !== 'completed';
          
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
              </div>
              
              <div className="flex-1">
                <span className={`text-sm font-medium ${
                  isCompleted ? 'text-gray-900' : 
                  isCurrent ? 'text-blue-700 font-bold' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-8 italic">
        การวิเคราะห์อาจใช้เวลา 1-2 นาที ขึ้นอยู่กับความยาวของเสียง
      </p>
    </div>
  );
}
