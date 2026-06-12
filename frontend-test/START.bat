@echo off
echo ========================================
echo   SAJAG AI - Starting...
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] Installing packages... (first time only, ~2-5 min)
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed.
        echo Make sure Node.js is installed: https://nodejs.org
        pause
        exit /b 1
    )
)

echo [2/2] Starting SAJAG AI...
echo.
echo Browser will open at: http://localhost:3000
echo Press Ctrl+C to stop.
echo.
npm start
pause
