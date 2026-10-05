@echo off
chcp 65001 >nul
title Voice Coach AI - Backend Server (Port 8000)
cd /d "%~dp0backend"

echo ========================================================
echo   🎙️ Voice Coach AI - Backend Server (FastAPI)
echo ========================================================
echo.

if not exist "venv\Scripts\activate.bat" (
    echo [!] ไม่พบ virtual environment กำลังสร้าง backend\venv...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] ไม่สามารถสร้าง virtual environment ได้ กรุณาตรวจสอบว่าได้ติดตั้ง Python แล้ว
        pause
        exit /b 1
    )
    call venv\Scripts\activate.bat
    echo [*] กำลังติดตั้ง Dependencies...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

echo [*] เริ่มต้นเซิร์ฟเวอร์ Backend ที่ http://localhost:8000 ...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
