@echo off
echo.
echo ========================================
echo   AI Print Assistant — Build Installer
echo ========================================
echo.

cd /d D:\Claude_Print_Assistant

echo [1/3] Building React app with Vite...
call npm run build
if errorlevel 1 (
  echo ERROR: Vite build failed!
  pause
  exit /b 1
)

echo.
echo [2/3] Packaging with electron-builder...
call npx electron-builder --win nsis
if errorlevel 1 (
  echo ERROR: electron-builder failed!
  pause
  exit /b 1
)

echo.
echo [3/3] Done!
echo.
echo Installer saved to: D:\User Application\
echo.
explorer "D:\User Application"
pause
