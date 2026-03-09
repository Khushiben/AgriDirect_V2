@echo off
echo ========================================
echo   AgriDirect - Installing Dependencies
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

echo [1/3] Installing Backend Dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

echo [2/3] Installing Frontend Dependencies...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

echo [3/3] Setup Complete!
echo.
echo ========================================
echo   Installation Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Configure server/.env file with your settings
echo 3. Run start.bat to start the application
echo.
pause
