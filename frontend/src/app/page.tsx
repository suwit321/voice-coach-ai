'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mic2, Activity, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { AnalysisListItem } from '@/lib/types';
import { HistoryList } from '@/components/history-list';

export default function HomePage() {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const items = await apiClient.getAnalysisList();
        setRecentAnalyses(items.slice(0, 3)); // show top 3
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
      setRecentAnalyses(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
      alert('ไม่สามารถลบข้อมูลได้');
    }
  };

  return (
    <div className="space-y-16 pb-8">
      
      {/* Hero Section */}
      <section className="text-center pt-12 pb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl text-blue-600 mb-6">
          <Mic2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          พัฒนาการพูดของคุณ<br className="md:hidden" />ด้วย <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Voice Coach AI</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          ฝึกซ้อมการนำเสนอ การสัมภาษณ์งาน หรืองานขายได้อย่างมั่นใจ AI จะช่วยวิเคราะห์น้ำเสียง จังหวะการพูด และเนื้อหา พร้อมให้คำแนะนำเพื่อการพัฒนาที่ตรงจุด
        </p>
        <Link href="/analyze">
          <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            เริ่มวิเคราะห์การพูด
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">วิเคราะห์น้ำเสียง</h3>
          <p className="text-gray-600 text-sm leading-relaxed">วัดความเร็ว จังหวะการหยุดพัก ระดับพลังงานเสียง เพื่อให้คุณสื่อสารได้อย่างน่าฟัง</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">ตรวจสอบเนื้อหา</h3>
          <p className="text-gray-600 text-sm leading-relaxed">ตรวจจับคำฟุ่มเฟือย แนะนำการเรียบเรียงประโยคใหม่ให้กระชับและตรงประเด็นมากขึ้น</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mic2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">ออกแบบตามสถานการณ์</h3>
          <p className="text-gray-600 text-sm leading-relaxed">เลือกรูปแบบการพูดที่คุณต้องการฝึก เช่น การสัมภาษณ์งาน การนำเสนอ หรือการขาย</p>
        </div>
      </section>

      {/* Recent History */}
      {!loading && recentAnalyses.length > 0 && (
        <section className="max-w-4xl mx-auto pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">ประวัติล่าสุด</h2>
            <Link href="/history" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              ดูทั้งหมด →
            </Link>
          </div>
          <HistoryList items={recentAnalyses} onDelete={handleDelete} />
        </section>
      )}

    </div>
  );
}
