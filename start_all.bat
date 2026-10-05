@echo off
title Voice Coach AI - Local Web App
cls

echo ======================================================================
echo           Voice Coach AI - Local Web Application
echo ======================================================================
echo.
echo [1/3] Starting Backend Server on port 8000...
start "Voice Coach Backend" cmd /k "%~dp0run_backend.bat"

echo [2/3] Starting Frontend Web App on port 3000...
start "Voice Coach Frontend" cmd /k "%~dp0run_frontend.bat"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo.
echo ======================================================================
echo   Voice Coach AI is ready!
echo   - Web App: http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo ======================================================================
echo.
echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo You can minimize this window. To stop the servers, run stop_all.bat.
pause
