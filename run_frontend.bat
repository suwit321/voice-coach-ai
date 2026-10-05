@echo off
chcp 65001 >nul
title Voice Coach AI - Frontend Web App (Port 3000)
cd /d "%~dp0frontend"

echo ========================================================
echo   🎙️ Voice Coach AI - Frontend Web App (Next.js)
echo ========================================================
echo.

if not exist "node_modules\" (
    echo [!] ไม่พบ node_modules กำลังรัน npm install...
    call npm install
)

echo [*] เริ่มต้นเซิร์ฟเวอร์ Frontend ที่ http://localhost:3000 ...
npm run dev
