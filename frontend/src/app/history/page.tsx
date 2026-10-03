'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { AnalysisListItem } from '@/lib/types';
import { HistoryList } from '@/components/history-list';
import { Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getScoreColor } from '@/lib/utils';

export default function HistoryPage() {
  const [items, setItems] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getAnalysisList();
        setItems(data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteAnalysis(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
      alert('ไม่สามารถลบข้อมูลได้');
    }
  };

  const completedItems = items.filter(i => i.status === 'completed');
  const avgScore = completedItems.length > 0 
    ? completedItems.reduce((acc, curr) => acc + curr.overall_score, 0) / completedItems.length 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการฝึกซ้อม</h1>
        <p className="text-gray-500">ติดตามพัฒนาการและดูผลการวิเคราะห์ย้อนหลังของคุณ</p>
      </div>

      {completedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="text-blue-100 text-sm font-medium mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                คะแนนเฉลี่ยรวม
              </div>
              <div className="text-4xl font-bold">{Math.round(avgScore)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-gray-500 text-sm font-medium mb-2">จำนวนครั้งที่ฝึกซ้อม</div>
              <div className="text-4xl font-bold text-gray-900">{completedItems.length}</div>
            </CardContent>
          </Card>

          {completedItems.length > 1 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-gray-500 text-sm font-medium mb-2">คะแนนล่าสุด</div>
                <div className="flex items-end space-x-3">
                  <div className="text-4xl font-bold text-gray-900">{Math.round(completedItems[0].overall_score)}</div>
                  {(() => {
                    const diff = completedItems[0].overall_score - completedItems[1].overall_score;
                    if (diff > 0) return <span className="text-sm font-medium text-green-500 mb-1">+{diff.toFixed(1)}</span>;
                    if (diff < 0) return <span className="text-sm font-medium text-red-500 mb-1">{diff.toFixed(1)}</span>;
                    return null;
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">รายการทั้งหมด</h2>
        <HistoryList items={items} onDelete={handleDelete} />
      </div>
    </div>
  );
}
