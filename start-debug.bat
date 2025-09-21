@echo off
title File Share Server - Debug Mode
echo.
echo ==========================================
echo    File Share Server - Debug Mode
echo ==========================================
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Starting server in debug mode...
echo Open browser and check console for errors:
echo http://localhost:3000
echo http://localhost:3000/test.html
echo.

node server.js
pause