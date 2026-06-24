@echo off
title AI Print Assistant - Launcher
echo.
echo  ============================================
echo   AI Print Assistant - Starting Up...
echo  ============================================
echo.

cd /d D:\Claude_Print_Assistant

echo [1/2] Starting Vite Dev Server on port 3000...
start "AIPA - Vite Dev Server" cmd /k "cd /d D:\Claude_Print_Assistant && npm run dev"

echo [2/2] Waiting 4 seconds for Vite to boot...
timeout /t 4 /nobreak >nul

echo Starting Electron App...
npm run electron

echo.
echo App closed. You can close this window.
pause
