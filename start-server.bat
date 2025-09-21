@echo off
color 0A
title File Share Server - Starting...
mode con cols=120 lines=50
cls
echo.
echo ==========================================
echo    Windows to iOS File Share System
echo ==========================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: Please run this script from the project directory
    echo Make sure you're in the wintoios-file-share-system folder
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and restart this script.
    echo.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check if packages are installed
echo.
echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    echo This may take a few minutes on first run...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ERROR: Failed to install dependencies
        echo.
        echo Please check your internet connection and try again.
        echo You can also try running: npm install
        echo.
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo [3/3] Starting File Share Server...
echo.
echo The server will start in 3 seconds...
timeout /t 3 /nobreak >nul
cls

title File Share Server - Running
npm start

REM If we get here, the server stopped
echo.
echo Server has stopped.
pause