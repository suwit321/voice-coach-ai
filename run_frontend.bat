@echo off
title Voice Coach AI - Frontend Web App
cd /d "%~dp0frontend"

echo ========================================================
echo   Voice Coach AI - Frontend Web App [Next.js Port 3000]
echo ========================================================
echo.

if not exist "node_modules\" (
    echo [*] Installing frontend dependencies...
    call npm install
)

echo [*] Starting Next.js Frontend on http://localhost:3000 ...
npm run dev
