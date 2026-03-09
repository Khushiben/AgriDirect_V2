@echo off
title AgriDirect - Startup Manager
color 0A

echo ========================================
echo   AgriDirect - Starting Application
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    echo Please install npm
    pause
    exit /b 1
)

REM Start MongoDB (if using local MongoDB)
echo [2/4] Checking MongoDB...
echo Note: Make sure MongoDB is running on your system
echo If using MongoDB Atlas, you can skip this step
echo.

REM Start the backend server
echo [3/4] Starting Backend Server...
cd server
start "AgriDirect Backend" cmd /k "color 0B && echo Backend Server Running... && npm run dev"
cd ..
echo Backend server starting on http://localhost:5000
echo.

REM Wait a bit for backend to start
echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

REM Start the frontend client
echo [4/4] Starting Frontend Client...
cd client
start "AgriDirect Frontend" cmd /k "color 0E && echo Frontend Client Running... && npm run dev"
cd ..
echo Frontend client starting on http://localhost:5173
echo.

echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:5173

echo.
echo ========================================
echo   Application is now running!
echo ========================================
echo.
echo To stop the application:
echo 1. Close both terminal windows (Backend and Frontend)
echo 2. Or press Ctrl+C in each window
echo 3. Or run stop.bat
echo.
echo This window can be closed safely.
echo.
pause
