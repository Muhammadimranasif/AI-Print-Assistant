@echo off
echo.
echo ========================================
echo  AI Print Assistant — Publish to GitHub
echo ========================================
echo.
echo This will BUILD and PUBLISH a release to GitHub.
echo Make sure GH_TOKEN is set as a Windows User environment variable!
echo.

:: Verify GH_TOKEN is set
if "%GH_TOKEN%"=="" (
  echo ERROR: GH_TOKEN environment variable is not set!
  echo.
  echo To set it:
  echo   1. Right-click "This PC" → Properties → Advanced system settings
  echo   2. Environment Variables → User variables → New
  echo   3. Variable name: GH_TOKEN
  echo   4. Variable value: your GitHub personal access token
  echo.
  pause
  exit /b 1
)

cd /d D:\Claude_Print_Assistant

echo [1/2] Building React + packaging...
call npm run build
if errorlevel 1 (
  echo ERROR: Build failed!
  pause
  exit /b 1
)

echo.
echo [2/2] Publishing release to GitHub...
call npx electron-builder --win nsis --publish always
if errorlevel 1 (
  echo ERROR: Publish failed!
  pause
  exit /b 1
)

echo.
echo SUCCESS! Release published to GitHub.
echo Check: https://github.com/YOUR_GITHUB_USERNAME/AI-Print-Assistant/releases
echo.
pause
