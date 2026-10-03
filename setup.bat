@echo off
echo ====================================================
echo Voice Coach AI - Setup Script
echo ====================================================

echo [1/3] Setting up Python virtual environment...
cd /d "%~dp0backend"
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created at backend\venv
) else (
    echo Virtual environment already exists at backend\venv
)

echo [2/3] Installing backend dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

if not exist ".env" (
    copy .env.example .env
    echo Created backend\.env from .env.example
)

echo [3/3] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install

echo ====================================================
echo Setup complete!
echo To run backend:  run_backend.bat
echo To run frontend: run_frontend.bat
echo Or run both:     start_all.bat
echo ====================================================
pause
