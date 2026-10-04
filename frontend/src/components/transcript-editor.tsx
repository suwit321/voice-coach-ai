'use client';

import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
import { Button } from './ui/button';

interface WordToken {
  index: number;
  text: string;
  type: 'normal' | 'filler' | 'step' | 'circular' | 'repeated';
  note?: string;
}

interface TranscriptEditorProps {
  initialTranscript: string;
  onSave?: (text: string) => void;
  readOnly?: boolean;
  fillerWords?: { word: string; count: number }[];
  wordTokens?: WordToken[];
}

export function TranscriptEditor({ 
  initialTranscript, 
  onSave, 
  readOnly = false, 
  fillerWords = [],
  wordTokens
}: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialTranscript);
  const [selectedToken, setSelectedToken] = useState<WordToken | null>(null);

  React.useEffect(() => {
    setText(initialTranscript);
  }, [initialTranscript]);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(text);
  };

  const renderWordByWordTokens = () => {
    if (!wordTokens || wordTokens.length === 0) {
      return renderHighlightedText();
    }

    return (
      <div className="flex flex-wrap gap-1.5 leading-loose">
        {wordTokens.map((token, i) => {
          if (token.type === 'filler') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold cursor-pointer transition-colors shadow-2xs text-sm"
                title={`${token.text} - คำฟุ่มเฟือย/คำติดปาก`}
              >
                {token.text}
              </span>
            );
          }
          if (token.type === 'step') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-semibold cursor-pointer transition-colors shadow-2xs text-sm"
                title={`${token.text} - คำเชื่อมบอกลำดับขั้นตอน`}
              >
                {token.text}
              </span>
            );
          }
          if (token.type === 'circular') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-semibold cursor-pointer transition-colors shadow-2xs text-sm"
                title={`${token.text} - คำส่อแววพูดวนซ้ำ`}
              >
                {token.text}
              </span>
            );
          }
          if (token.type === 'repeated') {
            return (
              <span
                key={i}
                onClick={() => setSelectedToken(token)}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 cursor-pointer transition-colors text-sm"
                title={`${token.text} - คำที่ใช้บ่อย`}
              >
                {token.text}
              </span>
            );
          }
          return <span key={i} className="text-gray-800 text-sm hover:text-blue-600 transition-colors">{token.text}</span>;
        })}
      </div>
    );
  };

  const renderHighlightedText = () => {
    if (fillerWords.length === 0) return text;
    
    // Sort by length descending to match longest phrases first
    const words = fillerWords.map(f => f.word).sort((a, b) => b.length - a.length);
    if (words.length === 0) return text;

    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (words.some(w => w.toLowerCase() === part.toLowerCase())) {
        return (
          <mark key={i} className="bg-amber-100 text-amber-900 border border-amber-300 rounded px-1 font-semibold">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">ข้อความที่ถอดเสียง (Transcript)</h3>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
              <><Check className="w-4 h-4 mr-2" /> บันทึก</>
            ) : (
              <><Edit2 className="w-4 h-4 mr-2" /> แก้ไข</>
            )}
          </Button>
        )}
      </div>

      {/* Legend & Token inspector when word tokens exist */}
      {readOnly && wordTokens && wordTokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-700">สัญลักษณ์คำต่อคำ:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-medium">
            คำฟุ่มเฟือย/ติดปาก
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium">
            บอกลำดับขั้นตอน
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 font-medium">
            ส่อแววพูดวน
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 font-medium">
            ใช้คำซ้ำบ่อย
          </span>
        </div>
      )}

      {selectedToken && selectedToken.note && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between animate-fade-in">
          <div>
            <span className="font-bold mr-1">"{selectedToken.text}":</span>
            <span>{selectedToken.note} (คำที่ {selectedToken.index + 1})</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSelectedToken(null)}
            className="text-blue-500 hover:text-blue-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="w-full relative">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[150px] p-4 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-0 resize-y text-gray-800 leading-relaxed"
            placeholder="พิมพ์หรือแก้ไขข้อความที่นี่..."
          />
        ) : (
          <div className="w-full min-h-[150px] p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 leading-relaxed">
            {text ? renderWordByWordTokens() : <span className="text-gray-400 italic">ไม่มีข้อความ</span>}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-right">
        {text.length} ตัวอักษร
      </div>
    </div>
  );
}
