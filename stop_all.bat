@echo off
title Voice Coach AI - Stop Servers
cls

echo ======================================================================
echo           Stopping Voice Coach AI Servers...
echo ======================================================================
echo.

echo [*] Stopping Backend (Uvicorn / Python on port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [*] Stopping Frontend (Node.js on port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ======================================================================
echo   Voice Coach AI servers have been stopped.
echo ======================================================================
echo.
timeout /t 2 >nul
exit
