'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, getApiBase } from '@/lib/api-client';
import { AnalysisResponse } from '@/lib/types';
import { ScoreCard } from '@/components/score-card';
import { RadarChart } from '@/components/radar-chart';
import { MetricsDisplay } from '@/components/metrics-display';
import { FeedbackPanel } from '@/components/feedback-panel';
import { TranscriptEditor } from '@/components/transcript-editor';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { 
  Loader2, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowLeft, 
  RotateCcw, 
  FileText, 
  Sparkles,
  BarChart3,
  Volume2,
  Clock,
  Activity,
  Play
} from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rated, setRated] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await apiClient.getAnalysis(id);
        if (result.status === 'completed') {
          setData(result);
        } else if (result.status === 'failed') {
          setError(result.error_message || 'Analysis failed');
        } else {
          router.push('/history');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleExport = async (format: 'md' | 'json') => {
    try {
      const blob = await apiClient.exportAnalysis(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-analysis-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleRate = async (rating: 1 | -1) => {
    try {
      await apiClient.rateAnalysis(id, rating);
      setRated(rating === 1 ? 'up' : 'down');
    } catch (err) {
      console.error('Rating failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">กำลังโหลดผลการวิเคราะห์...</p>
      </div>
    );
  }

  if (error || !data || !data.feedback) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4">ไม่พบข้อมูลผลลัพธ์</h2>
        <p className="text-gray-600 mb-8">{error || 'ไม่สามารถโหลดผลการวิเคราะห์ได้'}</p>
        <Link href="/history">
          <Button>กลับไปหน้าประวัติ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <Link href="/history" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> ประวัติการฝึกซ้อม
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            ผลการวิเคราะห์: {data.preset.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            วิเคราะห์เมื่อ {formatDate(data.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-1.5" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('md')}>
            <Download className="w-4 h-4 mr-1.5" /> Markdown
          </Button>
          <Link href="/analyze">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-1.5" /> ฝึกซ้อมใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 1: Score & Radar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ScoreCard 
            score={data.overall_score} 
            presetName={data.preset.name} 
            presetIcon="Mic2"
          />
        </div>
        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
            การประเมิน 5 มิติการพูด
          </h3>
          <RadarChart data={data.radar} />
        </div>
      </div>

      {/* Section 1.5: Audio Playback (ฟังเสียงย้อนหลัง) */}
      {data.audio_url && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 rounded-3xl border border-blue-100 p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">ฟังเสียงการพูดที่คุณบันทึกไว้</h3>
              <p className="text-xs text-gray-500">สามารถกดฟังย้อนหลังเพื่อเปรียบเทียบกับผลการวิเคราะห์</p>
            </div>
          </div>
          <div className="w-full md:w-auto min-w-[280px]">
            <audio 
              controls 
              src={`${getApiBase()}${data.audio_url}`} 
              className="w-full rounded-xl shadow-2xs"
            >
              เบราว์เซอร์ของคุณไม่รองรับการเล่นไฟล์เสียง
            </audio>
          </div>
        </div>
      )}

      {/* Section 2: Spoken Transcript & Highlighted Content */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            เนื้อหาเสียงที่พูดและการวิเคราะห์คำต่อคำ (Verbatim & Transcript)
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-medium">
              คำฟุ่มเฟือย: {data.metrics.filler_count} ครั้ง ({data.metrics.wpm > 0 ? (data.metrics.filler_count / Math.max(1, Math.round(data.metrics.wpm * (data.metrics.duration_sec / 60))) * 100).toFixed(1) : 0}%)
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-medium">
              ความเร็ว: {data.metrics.wpm} WPM
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <TranscriptEditor 
            initialTranscript={data.transcript || 'ไม่มีเนื้อหาข้อความ'} 
            readOnly={true}
            fillerWords={data.metrics.filler_words}
            wordTokens={data.word_tokens}
          />
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
            💡 คลิกที่คำที่ถูกไฮไลต์แต่ละคำเพื่อดูประเภทและคำอธิบาย (คำติดปาก, ลำดับขั้นตอน, หรือคำส่อแววพูดวน)
          </p>
        </div>
      </div>

      {/* Section 2.5: Speech Rhythm Timeline & Pace (จังหวะเสียงและการเว้นวรรค) */}
      {((data.segments && data.segments.length > 0) || (data.pauses && data.pauses.length > 0)) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-600" />
            จังหวะเสียงและการเว้นวรรคตามช่วงเวลา (Speech Rhythm & Pauses)
          </h2>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
            {/* Rhythm Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-xs font-semibold text-indigo-700 block">ช่วงหยุดพักหายใจ/คิด (Pauses)</span>
                <span className="text-2xl font-black text-indigo-950 mt-1 block">
                  {data.metrics.pause_count} <span className="text-xs font-normal text-gray-500">ครั้ง</span>
                </span>
                <span className="text-2xs text-gray-500">เฉลี่ย {data.metrics.avg_pause_duration.toFixed(2)} วินาที/ครั้ง</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-700 block">สัดส่วนเวลาพูดจริง (Speech Ratio)</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">
                  {Math.round(data.metrics.speech_ratio * 100)}%
                </span>
                <span className="text-2xs text-gray-500">เวลาพูดเทียบกับเวลาหยุด</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-700 block">ความต่อเนื่องของจังหวะ</span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">
                  {data.metrics.wpm >= 100 && data.metrics.wpm <= 150 ? 'จังหวะพอดี' : data.metrics.wpm > 150 ? 'จังหวะเร็ว' : 'จังหวะช้า'}
                </span>
                <span className="text-2xs text-gray-500">{data.metrics.wpm} คำ/นาที (เป้าหมาย 100-150)</span>
              </div>
            </div>

            {/* Segment by segment timeline */}
            {data.segments && data.segments.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                  ไทม์ไลน์จังหวะการพูดแยกตามช่วงเวลา (Rhythm Segments)
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {data.segments.map((seg, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-lg bg-white border border-gray-200 font-mono text-xs text-gray-600 font-semibold shrink-0">
                          {Math.floor(seg.start / 60)}:{(Math.floor(seg.start % 60)).toString().padStart(2, '0')} - {Math.floor(seg.end / 60)}:{(Math.floor(seg.end % 60)).toString().padStart(2, '0')}
                        </span>
                        <p className="text-sm text-gray-800 leading-snug">{seg.text}</p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className={`text-2xs font-semibold px-2.5 py-1 rounded-full border ${
                          seg.pace.includes('เร็ว') 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : seg.pace.includes('ช้า')
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {seg.pace} ({seg.wpm} WPM)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 3: Acoustics & Speech Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          สถิติทางกายภาพของเสียง (Audio & Prosody Metrics)
        </h2>
        <MetricsDisplay metrics={data.metrics} />
      </div>

      {/* Section 4: AI Coaching Feedback & Content Coherence */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          การประเมินเนื้อหาและคำแนะนำจาก AI Coach
        </h2>
        <FeedbackPanel feedback={data.feedback} />
      </div>

      {/* Section 5: Helpful Rating Footer */}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          คำแนะนำและผลการวิเคราะห์นี้มีประโยชน์ต่อการฝึกซ้อมของคุณหรือไม่?
        </h3>
        <div className="flex items-center gap-4">
          <Button 
            variant={rated === 'up' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handleRate(1)}
            disabled={rated !== null}
            className="rounded-xl px-5"
          >
            <ThumbsUp className="w-4 h-4 mr-2" /> มีประโยชน์
          </Button>
          <Button 
            variant={rated === 'down' ? 'danger' : 'outline'} 
            size="sm" 
            onClick={() => handleRate(-1)}
            disabled={rated !== null}
            className="rounded-xl px-5"
          >
            <ThumbsDown className="w-4 h-4 mr-2" /> ควรปรับปรุง
          </Button>
        </div>
        {rated && (
          <p className="text-xs text-green-600 mt-3 font-medium">
            ขอบคุณสำหรับข้อเสนอแนะ! ระบบจะนำไปพัฒนาคุณภาพของ AI Coach ให้ดียิ่งขึ้น
          </p>
        )}
      </div>

    </div>
  );
}
