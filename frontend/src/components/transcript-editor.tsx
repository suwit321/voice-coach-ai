'use client';

import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
import { Button } from './ui/button';

interface TranscriptEditorProps {
  initialTranscript: string;
  onSave?: (text: string) => void;
  readOnly?: boolean;
  fillerWords?: { word: string; count: number }[];
}

export function TranscriptEditor({ initialTranscript, onSave, readOnly = false, fillerWords = [] }: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialTranscript);

  React.useEffect(() => {
    setText(initialTranscript);
  }, [initialTranscript]);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(text);
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
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-1">
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

      <div className="w-full relative">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[150px] p-4 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-0 resize-y text-gray-800 leading-relaxed"
            placeholder="พิมพ์หรือแก้ไขข้อความที่นี่..."
          />
        ) : (
          <div className="w-full min-h-[150px] p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 leading-relaxed whitespace-pre-wrap">
            {text ? renderHighlightedText() : <span className="text-gray-400 italic">ไม่มีข้อความ</span>}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-right">
        {text.length} ตัวอักษร
      </div>
    </div>
  );
}
