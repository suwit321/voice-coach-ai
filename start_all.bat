@echo off
chcp 65001 >nul
title Voice Coach AI - Local Web App Runner
cls

echo ======================================================================
echo           🎙️  Voice Coach AI - โค้ชฝึกทักษะการพูดด้วย AI
echo           (ระบบ Web Application สำหรับใช้งานในเครื่องคอมพิวเตอร์)
echo ======================================================================
echo.
echo [1/3] กำลังเปิด Backend Server (FastAPI บนพอร์ต 8000)...
start "Voice Coach Backend" cmd /k "%~dp0run_backend.bat"

echo [2/3] กำลังเปิด Frontend Web App (Next.js บนพอร์ต 3000)...
start "Voice Coach Frontend" cmd /k "%~dp0run_frontend.bat"

echo [3/3] กำลังเตรียมความพร้อมระบบ กรุณารอสักครู่ (ประมาณ 4 วินาที)...
timeout /t 4 /nobreak >nul

echo.
echo ======================================================================
echo   ✅ เปิดระบบสำเร็จแล้ว! 
echo   - 🌐 หน้าเว็บแอป: http://localhost:3000
echo   - ⚙️ เซิร์ฟเวอร์ API: http://localhost:8000 (เอกสาร API: http://localhost:8000/docs)
echo   - 🔒 ข้อมูลทั้งหมดทำงานและบันทึกในเครื่องของคุณอย่างปลอดภัย 100%%
echo ======================================================================
echo.
echo กำลังเปิดเบราว์เซอร์อัตโนมัติ...
start http://localhost:3000

echo.
echo (💡 คุณสามารถย่อหน้าต่างนี้ลงได้ และหากต้องการปิดโปรแกรม ให้ดับเบิลคลิก stop_all.bat)
pause
