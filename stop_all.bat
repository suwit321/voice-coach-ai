@echo off
chcp 65001 >nul
title Voice Coach AI - Stop Servers
cls

echo ======================================================================
echo           🛑 กำลังปิดเซิร์ฟเวอร์ Voice Coach AI...
echo ======================================================================
echo.

echo [*] ปิด Backend (Uvicorn / Python)...
taskkill /f /im uvicorn.exe >nul 2>&1

echo [*] ปิด Frontend (Node.js)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ======================================================================
echo   ✅ ปิดการทำงานของ Voice Coach AI เรียบร้อยแล้ว
echo ======================================================================
echo.
timeout /t 2 >nul
exit
