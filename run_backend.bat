@echo off
echo Starting Voice Coach Backend (FastAPI on port 8000)...
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
uvicorn app.main:app --reload --port 8000
