@echo off
echo ========================================
echo   AgriDirect - Stopping Application
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Application stopped successfully!
echo.
pause
