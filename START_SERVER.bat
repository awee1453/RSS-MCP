@echo off
chcp 65001 > nul
echo ========================================
echo    RSS-MCP v3.0 Server Launcher       
echo ========================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check node_modules
if not exist "node_modules" (
    echo.
    echo ERROR: node_modules not found!
    echo.
    echo Please run FIRST_TIME_SETUP.bat first.
    echo.
    pause
    exit /b 1
)

echo [1/2] Preparation checks completed
echo ----------------------------------------
echo.

echo [2/2] Starting RSS-MCP Server...
echo ----------------------------------------
echo.

REM Start the server
call npm start

if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start!
    echo.
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

REM Show message when server stops
echo.
echo ========================================
echo   Server stopped                     
echo ========================================
echo.
