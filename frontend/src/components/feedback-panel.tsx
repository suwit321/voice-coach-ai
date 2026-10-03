import React, { useState } from 'react';
import { Feedback } from '@/lib/types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Compass,
  ListOrdered,
  Repeat,
  Volume2,
  Square,
  Sparkles
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

interface FeedbackPanelProps {
  feedback: Feedback;
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const [expandedPriority, setExpandedPriority] = useState<number | null>(0);
  const { isSupported, isPlaying, currentText, speak, stop } = useSpeechSynthesis();

  return (
    <div className="space-y-8">
      
      {/* Content & Structure Coherence Analysis (ฟังรู้เรื่อง / เป็นขั้นตอน / วกวน) */}
      {feedback.content_coherence && (
        <section className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl p-6 border border-purple-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <h3 className="flex items-center text-lg font-bold text-purple-950">
              <Compass className="w-5 h-5 mr-2 text-purple-600" />
              การวิเคราะห์เนื้อหาและความเข้าใจ (Content & Coherence)
            </h3>
            <div className="flex items-center space-x-2 bg-purple-100/80 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-800">
              <span>คะแนนความต่อเนื่อง:</span>
              <span className="text-sm font-bold text-purple-900">
                {feedback.content_coherence.coherence_score} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. ฟังรู้เรื่องหรือไม่ */}
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-blue-600" />
                  ความเข้าใจ (ฟังรู้เรื่องหรือไม่)
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
                  {feedback.content_coherence.clarity_level}
                </p>
              </div>
            </div>

            {/* 2. พูดเป็นขั้นตอนหรือไม่ */}
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center">
                  <ListOrdered className="w-4 h-4 mr-1 text-green-600" />
                  การจัดลำดับ (พูดเป็นขั้นตอน)
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
                  {feedback.content_coherence.structure_flow}
                </p>
              </div>
            </div>

            {/* 3. พูดวกวนหรือไม่ */}
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center">
                  <Repeat className="w-4 h-4 mr-1 text-amber-600" />
                  ความกระชับ (พูดวกวนหรือไม่)
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
                  {feedback.content_coherence.circular_analysis}
                </p>
              </div>
            </div>
          </div>

          {/* Details / Observations */}
          {feedback.content_coherence.details && feedback.content_coherence.details.length > 0 && (
            <div className="bg-white/90 p-4 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-1.5">
              <span className="font-bold text-purple-900 block mb-1">ข้อสังเกตเพิ่มเติมด้านเนื้อหา:</span>
              {feedback.content_coherence.details.map((detail, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-purple-500 mr-2 font-bold">•</span>
                  <span className="leading-relaxed">{detail}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <section className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="flex items-center text-lg font-bold text-green-900 mb-4">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
            จุดแข็งของคุณ
          </h3>
          <ul className="space-y-3">
            {feedback.strengths.map((strength, i) => (
              <li key={i} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-green-800 leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Priorities */}
      {feedback.priorities.length > 0 && (
        <section className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <h3 className="flex items-center text-lg font-bold text-orange-900 mb-4">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            จุดที่ควรพัฒนา (Top Priorities)
          </h3>
          <div className="space-y-4">
            {feedback.priorities.map((priority, i) => {
              const isExpanded = expandedPriority === i;
              return (
                <div key={i} className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setExpandedPriority(isExpanded ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold mr-3">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-gray-900">{priority.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-orange-100 bg-white">
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">ปัญหาที่พบ (Evidence)</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md italic border-l-2 border-orange-300">"{priority.evidence}"</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">คำแนะนำ (Recommendation)</span>
                        <p className="text-sm text-gray-800">{priority.recommendation}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center mb-2">
                          <Target className="w-3 h-3 mr-1" />
                          แบบฝึกหัด (Exercise)
                        </span>
                        <p className="text-sm text-blue-900 leading-relaxed">{priority.exercise}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Content Rewrites with AI Voice Demonstration */}
      {feedback.content_rewrites.length > 0 && (
        <section className="bg-blue-50/80 rounded-2xl p-6 border border-blue-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="flex items-center text-lg font-bold text-blue-950">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              การเรียบเรียงประโยค (Content Rewrites)
            </h3>
            <span className="text-xs text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full font-medium">
              💡 คลิก "ฟังตัวอย่างเสียง AI" เพื่อฟังจังหวะการพูดที่แนะนำ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.content_rewrites.map((rewrite, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
                
                {/* Original Sentence */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-red-600">ประโยคเดิมที่พูด:</span>
                    {isSupported && (
                      <button
                        type="button"
                        onClick={() => speak(rewrite.original, 1.0)}
                        className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors ${
                          isPlaying && currentText === rewrite.original
                            ? 'bg-red-100 text-red-700 font-semibold'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title="ฟังเสียงประโยคเดิม"
                      >
                        {isPlaying && currentText === rewrite.original ? (
                          <Square className="w-3 h-3 fill-current" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span>ฟังเปรียบเทียบ</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 line-through decoration-red-300 decoration-1">
                    {rewrite.original}
                  </p>
                </div>

                {/* Improved Sentence with Voice Demonstration Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-green-700 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-green-600" />
                      ประโยคใหม่ที่แนะนำ:
                    </span>
                    {isSupported && (
                      <button
                        type="button"
                        onClick={() => speak(rewrite.improved, 0.95)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs ${
                          isPlaying && currentText === rewrite.improved
                            ? 'bg-green-600 text-white animate-pulse'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 active:scale-95'
                        }`}
                        title="คลิกเพื่อฟังเสียงตัวอย่างที่แนะนำ"
                      >
                        {isPlaying && currentText === rewrite.improved ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>กำลังเล่น...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-green-700" />
                            <span>ฟังตัวอย่างเสียง AI</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 bg-green-50/70 p-3 rounded-xl border border-green-200 leading-relaxed">
                    {rewrite.improved}
                  </p>
                </div>

                {/* Reason */}
                <div className="pt-2 border-t border-gray-100 mt-auto">
                  <p className="text-xs text-gray-500 flex items-start">
                    <span className="font-semibold text-blue-600 mr-1 flex-shrink-0">เหตุผลที่ปรับ:</span>
                    <span>{rewrite.reason}</span>
                  </p>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* Practice Plan */}
      {feedback.practice_plan.length > 0 && (
        <section className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="flex items-center text-lg font-bold text-indigo-900 mb-4">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            แผนการฝึกซ้อม (Practice Plan)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-indigo-900 ml-2">
            {feedback.practice_plan.map((step, i) => (
              <li key={i} className="pl-2 leading-relaxed">{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Limitations Disclaimer */}
      {feedback.limitations.length > 0 && (
        <div className="text-xs text-gray-400 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="font-semibold mb-1 text-gray-500">ข้อจำกัดของการวิเคราะห์ (AI Limitations):</p>
          <ul className="list-disc list-inside space-y-1">
            {feedback.limitations.map((limit, i) => (
              <li key={i}>{limit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
