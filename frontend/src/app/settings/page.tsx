'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bot, 
  Mic2, 
  ShieldCheck, 
  Key, 
  Sliders, 
  Save, 
  RotateCcw, 
  Check, 
  Eye, 
  EyeOff, 
  Copy, 
  Volume2, 
  Zap, 
  Info,
  Trash2,
  Lock,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSettings, saveSettings, resetSettings, AppSettings, DEFAULT_SETTINGS } from '@/lib/settings';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'speech' | 'privacy'>('ai');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSttKey, setShowSttKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [copiedSession, setCopiedSession] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    if (typeof window !== 'undefined') {
      const sid = localStorage.getItem('voice-coach-session-id') || 'ยังไม่มี Session ID';
      setSessionId(sid);
    }
  }, []);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('ต้องการคืนค่าการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      const res = resetSettings();
      setSettings(res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleCopySession = () => {
    if (navigator.clipboard && sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopiedSession(true);
      setTimeout(() => setCopiedSession(false), 2000);
    }
  };

  const handleNewSession = () => {
    if (confirm('การสร้าง Session ID ใหม่จะทำให้หน้าประวัติเริ่มต้นนับใหม่ ต้องการสร้างต่อหรือไม่?')) {
      const newId = crypto.randomUUID();
      localStorage.setItem('voice-coach-session-id', newId);
      setSessionId(newId);
      alert('สร้าง Session ID ใหม่เรียบร้อยแล้ว');
    }
  };

  const [isPurging, setIsPurging] = useState(false);

  const handlePurgeAll = async () => {
    if (!confirm('⚠️ คำเตือนสำคัญ:\nคุณแน่ใจหรือไม่ว่าต้องการลบประวัติการฝึกและไฟล์เสียงทั้งหมดของคุณอย่างถาวร (Right to be Forgotten)?\nการกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }
    try {
      setIsPurging(true);
      const res = await apiClient.purgeAllSessionData();
      const newId = crypto.randomUUID();
      localStorage.setItem('voice-coach-session-id', newId);
      setSessionId(newId);
      alert(`ลบข้อมูลสำเร็จ!\n- ลบประวัติการวิเคราะห์: ${res.deleted_analyses} รายการ\n- ลบไฟล์เสียง: ${res.deleted_audio_files} ไฟล์`);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการลบข้อมูล: ${err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'}`);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            การตั้งค่าระบบ (Settings)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ปรับแต่งโมเดล AI, พฤติกรรมการบันทึกเสียง, และความเป็นส่วนตัวตามที่คุณต้องการ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset} className="rounded-xl">
            <RotateCcw className="w-4 h-4 mr-1.5" /> คืนค่าเริ่มต้น
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5">
            {savedSuccess ? (
              <><Check className="w-4 h-4 mr-1.5 text-white" /> บันทึกแล้ว!</>
            ) : (
              <><Save className="w-4 h-4 mr-1.5" /> บันทึกการตั้งค่า</>
            )}
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center shadow-xs animate-in fade-in duration-200">
          <Check className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
          <span className="font-semibold">บันทึกการตั้งค่าเรียบร้อยแล้ว! การตั้งค่าจะมีผลทันทีในการวิเคราะห์ครั้งถัดไป</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center space-x-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ai'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI & โมเดลประมวลผล</span>
        </button>
        <button
          onClick={() => setActiveTab('speech')}
          className={`flex items-center space-x-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'speech'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Mic2 className="w-4 h-4" />
          <span>การบันทึกเสียง & เป้าหมาย</span>
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center space-x-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'privacy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ความเป็นส่วนตัว & ข้อมูล</span>
        </button>
      </div>

      {/* Tab 1: AI Provider & Keys */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card className="rounded-3xl border-gray-200 shadow-xs">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-600" />
                  ผู้ให้บริการ AI (LLM Provider)
                </h3>
                <p className="text-xs text-gray-500">
                  เลือกค่าย AI ที่ต้องการใช้เป็นโค้ชวิเคราะห์และให้คำแนะนำ
                </p>
              </div>

              {/* Backend API Server URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    ที่อยู่ Backend Server URL (API Host)
                  </label>
                  <span className="text-2xs text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                    {settings.apiUrl ? 'กำหนดเอง' : 'ค่าเริ่มต้น (Default)'}
                  </span>
                </div>
                <input
                  type="text"
                  value={settings.apiUrl || ''}
                  onChange={(e) => handleChange('apiUrl', e.target.value)}
                  placeholder="เช่น http://localhost:8000 หรือ https://your-backend.onrender.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <p className="text-xs text-slate-500">
                  หากรันในเครื่องให้เว้นว่างไว้หรือใส่ <code>http://localhost:8000</code> หาก Deploy บน Render ให้ใส่ URL ของ Render
                </p>
              </div>

              {/* Provider Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4o-mini', color: 'border-green-500 bg-green-50/20' },
                  { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3.5 Sonnet', color: 'border-amber-500 bg-amber-50/20' },
                  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 2.0 Flash', color: 'border-blue-500 bg-blue-50/20' },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => {
                      handleChange('llmProvider', prov.id);
                      if (prov.id === 'openai') handleChange('llmModel', 'gpt-4o');
                      if (prov.id === 'anthropic') handleChange('llmModel', 'claude-3-5-sonnet-20240620');
                      if (prov.id === 'gemini') handleChange('llmModel', 'gemini-2.0-flash');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      settings.llmProvider === prov.id
                        ? `${prov.color} ring-2 ring-blue-100 shadow-xs font-bold`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-gray-900">{prov.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{prov.desc}</p>
                  </button>
                ))}
              </div>

              {/* Model Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  รุ่นของโมเดล (Model Name)
                </label>
                <input
                  type="text"
                  value={settings.llmModel}
                  onChange={(e) => handleChange('llmModel', e.target.value)}
                  placeholder="เช่น gpt-4o หรือ gemini-2.0-flash"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* LLM API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    API Key ({settings.llmProvider.toUpperCase()})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                    {showApiKey ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.llmApiKey}
                    onChange={(e) => handleChange('llmApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  🔒 คีย์จะถูกจัดเก็บเฉพาะในเบราว์เซอร์ของคุณ และส่งไปยังเซิร์ฟเวอร์เฉพาะตอนประมวลผลเท่านั้น
                </p>
              </div>

              {/* STT Section */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">การถอดเสียงเป็นข้อความ (Whisper STT)</h4>
                    <p className="text-xs text-gray-500">ใช้สำหรับแปลงเสียงพูดภาษาไทยเป็นข้อความอัตโนมัติ</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAutoStt}
                    onChange={(e) => handleChange('enableAutoStt', e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {settings.enableAutoStt && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600">
                        OpenAI Whisper API Key (เว้นว่างไว้หากใช้คีย์เดียวกับ OpenAI ด้านบน)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSttKey(!showSttKey)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                      >
                        {showSttKey ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                        {showSttKey ? 'ซ่อน' : 'แสดง'}
                      </button>
                    </div>
                    <input
                      type={showSttKey ? 'text' : 'password'}
                      value={settings.sttApiKey}
                      onChange={(e) => handleChange('sttApiKey', e.target.value)}
                      placeholder="sk-... (เว้นว่างเพื่อใช้คีย์หลัก)"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Speech & Recording Preferences */}
      {activeTab === 'speech' && (
        <div className="space-y-6">
          <Card className="rounded-3xl border-gray-200 shadow-xs">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                  <Sliders className="w-5 h-5 mr-2 text-blue-600" />
                  พฤติกรรมการบันทึกเสียง & เป้าหมายการพูด
                </h3>
                <p className="text-xs text-gray-500">
                  ปรับความสะดวกในการฝึกพูดและเป้าหมายความเร็วคำต่อนาที (WPM)
                </p>
              </div>

              {/* Auto-Save Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      บันทึกประวัติและวิเคราะห์อัตโนมัติทันทีที่พูดจบ
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      เมื่อกดหยุดไมโครโฟน ระบบจะบันทึกประวัติและเริ่มวิเคราะห์ทันทีโดยไม่ต้องกดยืนยันหลายขั้นตอน
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveOnStop}
                  onChange={(e) => handleChange('autoSaveOnStop', e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Default Preset */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  รูปแบบการพูดเริ่มต้น (Default Preset)
                </label>
                <select
                  value={settings.defaultPreset}
                  onChange={(e) => handleChange('defaultPreset', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="meeting">🏢 การประชุม/รายงาน (เน้นกระชับและเป็นทางการ)</option>
                  <option value="public_speaking">🎤 พูดต่อหน้าชุมชน (เน้นพลังเสียงและดึงดูด)</option>
                  <option value="mc">🎭 พิธีกร (เน้นลื่นไหลและคุมจังหวะ)</option>
                </select>
              </div>

              {/* Target WPM Range */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  เป้าหมายความเร็วการพูด (WPM: คำต่อนาที)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">ความเร็วต่ำสุด (Min WPM)</span>
                    <input
                      type="number"
                      value={settings.targetWpmMin}
                      onChange={(e) => handleChange('targetWpmMin', Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">ความเร็วสูงสุด (Max WPM)</span>
                    <input
                      type="number"
                      value={settings.targetWpmMax}
                      onChange={(e) => handleChange('targetWpmMax', Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Microphone Hardware Filters */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center">
                  <Volume2 className="w-4 h-4 mr-2 text-gray-700" />
                  การปรับแต่งสัญญาณไมโครโฟนในเบราว์เซอร์
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer">
                    <span>ตัดเสียงรบกวนรอบข้าง (Noise Suppression)</span>
                    <input
                      type="checkbox"
                      checked={settings.noiseSuppression}
                      onChange={(e) => handleChange('noiseSuppression', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer">
                    <span>ลดเสียงสะท้อน (Echo Cancellation)</span>
                    <input
                      type="checkbox"
                      checked={settings.echoCancellation}
                      onChange={(e) => handleChange('echoCancellation', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Privacy & Data */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card className="rounded-3xl border-gray-200 shadow-xs">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                  ความเป็นส่วนตัวและการจัดการข้อมูล
                </h3>
                <p className="text-xs text-gray-500">
                  ควบคุมการเก็บไฟล์เสียงและรหัสประจำตัวของเซสชัน
                </p>
              </div>

              {/* Audio Retention Policy */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-gray-900">เก็บไฟล์เสียงไว้ในเครื่องเซิร์ฟเวอร์</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ค่าเริ่มต้น: ปิด (ลบไฟล์เสียงทิ้งทันทีหลังวิเคราะห์เสร็จเพื่อความเป็นส่วนตัวสูงสุด)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.retainAudio}
                  onChange={(e) => handleChange('retainAudio', e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Session ID Management */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Session ID ปัจจุบัน
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sessionId}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopySession} className="h-10 px-3">
                    {copiedSession ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Session ID ใช้ระบุประวัติการฝึกซ้อมของคุณโดยไม่ต้องสมัครสมาชิก
                </p>
                <div className="pt-2">
                  <Button variant="ghost" size="sm" onClick={handleNewSession} className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                    รีเซ็ตและสลับ Session ID ใหม่
                  </Button>
                </div>
              </div>

              {/* PDPA Right to be Forgotten: Purge All Data */}
              <div className="pt-6 border-t border-red-100 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-red-700 flex items-center">
                      <Trash2 className="w-4 h-4 mr-1.5 text-red-600" />
                      ลบข้อมูลและประวัติทั้งหมดถาวร (Right to be Forgotten - PDPA)
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-lg">
                      คำสั่งนี้จะลบการวิเคราะห์ทั้งหมดและไฟล์เสียงที่เกี่ยวข้องกับ Session ID นี้ออกจากเซิร์ฟเวอร์อย่างสมบูรณ์ทันที
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPurging}
                    onClick={handlePurgeAll}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs shrink-0"
                  >
                    {isPurging ? 'กำลังลบข้อมูล...' : 'ลบข้อมูลทั้งหมด'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Safety Hub Card */}
          <Card className="rounded-3xl border-blue-100 bg-blue-50/30 shadow-xs">
            <CardContent className="p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold text-gray-950 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" />
                มาตรการความปลอดภัยและการปกป้องข้อมูล (Safety & Privacy Shield)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                  <div className="flex items-center text-blue-700 font-bold text-sm">
                    <Lock className="w-4 h-4 mr-1.5" /> ตัดข้อมูลส่วนบุคคล (PII)
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    ระบบตรวจจับและเซ็นเซอร์เลขบัตรประชาชน 13 หลัก, เบอร์โทรศัพท์, อีเมล และเลขบัตรเครดิต อัตโนมัติก่อนส่งให้ AI วิเคราะห์
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                  <div className="flex items-center text-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> นโยบาย Zero-Retention
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    ไฟล์เสียงชั่วคราวถูกลบทิ้งจากเซิร์ฟเวอร์ทันทีหลังการประมวลผล ไม่เก็บเป็นคลังข้อมูลดิบ เว้นแต่จะเปิดบันทึกไฟล์
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2">
                  <div className="flex items-center text-purple-700 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1.5" /> AI Safety Guardrails
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    เน้นพัฒนาทักษะการสื่อสาร ไม่มีการวินิจฉัยทางการแพทย์ จิตเวช หรือตัดสินนิสัยส่วนบุคคล และ API Keys เก็บเฉพาะบนเครื่องผู้ใช้
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl shadow-md font-semibold">
          <Save className="w-4 h-4 mr-2" /> บันทึกการตั้งค่าทั้งหมด
        </Button>
      </div>

    </div>
  );
}
