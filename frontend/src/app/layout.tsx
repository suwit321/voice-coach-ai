import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Mic2, History, Home, Settings } from 'lucide-react';

const notoSansThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Voice Coach AI',
  description: 'AI-powered public speaking coach MVP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="light">
      <body className={`${notoSansThai.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}>
        
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-2xs">
                <Mic2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight">Voice Coach AI</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center transition-colors">
                <Home className="w-4 h-4 mr-1.5" />
                หน้าแรก
              </Link>
              <Link href="/analyze" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center transition-colors">
                <Mic2 className="w-4 h-4 mr-1.5" />
                วิเคราะห์การพูด
              </Link>
              <Link href="/history" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center transition-colors">
                <History className="w-4 h-4 mr-1.5" />
                ประวัติ
              </Link>
              <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center transition-colors">
                <Settings className="w-4 h-4 mr-1.5" />
                ตั้งค่า
              </Link>
            </nav>
          </div>
        </header>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 px-2 py-2 flex items-center justify-around shadow-lg">
          <Link href="/" className="flex flex-col items-center py-1 px-3 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <Home className="w-5 h-5 mb-0.5" />
            <span>หน้าแรก</span>
          </Link>
          <Link href="/analyze" className="flex flex-col items-center py-1 px-3 text-xs font-semibold text-blue-600 transition-colors">
            <div className="bg-blue-600 text-white p-1.5 rounded-full -mt-4 shadow-md border-2 border-white">
              <Mic2 className="w-5 h-5" />
            </div>
            <span className="mt-0.5">ฝึกพูด</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center py-1 px-3 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <History className="w-5 h-5 mb-0.5" />
            <span>ประวัติ</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center py-1 px-3 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <Settings className="w-5 h-5 mb-0.5" />
            <span>ตั้งค่า</span>
          </Link>
        </nav>

        <main className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-8 pb-20 sm:pb-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Voice Coach AI - พัฒนาทักษะการพูดของคุณด้วย AI</p>
            <p className="text-xs text-gray-400">
              ข้อจำกัดความรับผิดชอบ: ข้อมูลและการวิเคราะห์สร้างโดย AI ควรใช้เป็นแนวทางเบื้องต้นในการพัฒนาตนเองเท่านั้น
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
