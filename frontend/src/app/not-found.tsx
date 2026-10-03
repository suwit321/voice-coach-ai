import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกลบไปแล้ว หรือคุณอาจพิมพ์ URL ไม่ถูกต้อง
      </p>
      <Link href="/">
        <Button size="lg">กลับสู่หน้าแรก</Button>
      </Link>
    </div>
  );
}
