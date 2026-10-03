'use client';

import React from 'react';
import Link from 'next/link';
import { AnalysisListItem } from '@/lib/types';
import { formatDate, getScoreColor, getScoreLabel } from '@/lib/utils';
import { Trash2, ChevronRight, BarChart2 } from 'lucide-react';
import { Button } from './ui/button';

interface HistoryListProps {
  items: AnalysisListItem[];
  onDelete: (id: string) => void;
}

export function HistoryList({ items, onDelete }: HistoryListProps) {
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 border-dashed text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีประวัติการวิเคราะห์</h3>
        <p className="text-gray-500 mb-6 max-w-sm">คุณสามารถเริ่มการวิเคราะห์การพูดครั้งแรกของคุณได้โดยคลิกปุ่มด้านล่าง</p>
        <Link href="/analyze">
          <Button>เริ่มวิเคราะห์เลย</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group">
          <Link href={`/results/${item.id}`} className="flex-1 flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0 ${getScoreColor(item.overall_score)}`}>
              {Math.round(item.overall_score)}
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                {item.preset_name}
              </h4>
              <div className="flex items-center text-xs text-gray-500 space-x-3">
                <span>{formatDate(item.created_at)}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="font-medium">{getScoreLabel(item.overall_score)}</span>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm('คุณต้องการลบประวัตินี้ใช่หรือไม่?')) {
                  onDelete(item.id);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="ลบ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Link href={`/results/${item.id}`}>
              <div className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
