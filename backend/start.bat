@echo off
echo ================================
echo   Starting SunCool Backend
echo ================================
echo.

cd /d "%~dp0"

echo Checking for node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server on port 3000...
echo Server will be available at: http://localhost:3000
echo Health check: http://localhost:3000/api/health
echo.
echo Press Ctrl+C to stop the server
echo ================================
echo.

node server.js
