@echo off
title Voice Coach AI - Backend Server
cd /d "%~dp0backend"

echo ========================================================
echo   Voice Coach AI - Backend Server [FastAPI Port 8000]
echo ========================================================
echo.

if not exist "venv\Scripts\activate.bat" (
    echo [*] Creating virtual environment backend\venv...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Please ensure Python is installed.
        pause
        exit /b 1
    )
    call venv\Scripts\activate.bat
    echo [*] Installing dependencies...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

echo [*] Starting FastAPI Backend on http://localhost:8000 ...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
