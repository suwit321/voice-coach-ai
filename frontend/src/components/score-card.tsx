import React from 'react';
import { getScoreColor, getScoreLabel, cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface ScoreCardProps {
  score: number;
  presetName: string;
  presetIcon: string;
}

export function ScoreCard({ score, presetName, presetIcon }: ScoreCardProps) {
  const colorClass = getScoreColor(score);
  const IconComponent = (Icons as any)[presetIcon] || Icons.Award;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 text-gray-500 mb-6">
        <IconComponent className="w-5 h-5" />
        <span className="font-medium text-sm uppercase tracking-wider">{presetName}</span>
      </div>
      
      <div className={cn(
        'relative flex items-center justify-center w-48 h-48 rounded-full border-[12px]',
        colorClass
      )}>
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-bold tracking-tighter">{Math.round(score)}</span>
          <span className="text-sm font-medium mt-1 opacity-80">คะแนนรวม</span>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <span className={cn('text-lg font-bold px-4 py-1.5 rounded-full', colorClass)}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
