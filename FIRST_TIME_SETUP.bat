@echo off
chcp 65001 > nul
echo ========================================
echo    RSS-MCP v3.0 Setup / Update         
echo ========================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo [1/4] Checking Node.js version...
echo ----------------------------------------
node --version
if errorlevel 1 (
    echo.
    echo ERROR: Node.js not found!
    echo Please install Node.js 18+: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Checking existing installation...
echo ----------------------------------------

REM Check if node_modules exists
if exist "node_modules" (
    echo.
    echo Existing installation found!
    echo Will update to latest versions only...
    echo.
    echo This script will install all dependencies
    echo and complete the configuration.
    echo.
    pause
    
    echo.
    echo [3/4] Updating packages to latest versions...
    echo ----------------------------------------
    echo This may take a few minutes...
    echo.
    
    call npm update
    
    if errorlevel 1 (
        echo.
        echo ========================================================
        echo WARNING: Some errors occurred during update
        echo ========================================================
        echo.
        echo If errors persist, try this command:
        echo   npm install --force
        echo.
        pause
    ) else (
        echo.
        echo Packages updated successfully!
    )
) else (
    echo.
    echo First-time installation detected...
    echo All dependencies will be installed.
    echo.
    echo This script will install all dependencies
    echo and complete the configuration.
    echo.
    pause
    
    echo.
    echo [3/4] Installing all dependencies...
    echo ----------------------------------------
    echo This may take a few minutes...
    echo.
    
    REM Install dependencies
    call npm install --prefer-offline --no-audit
    
    REM Error check - continue if better-sqlite3 fails
    if errorlevel 1 (
        echo.
        echo ========================================================
        echo WARNING: Some errors occurred during installation
        echo ========================================================
        echo.
        echo Checking for better-sqlite3 module...
        
        REM Check if better-sqlite3 module was installed
        if exist "node_modules\better-sqlite3" (
            echo.
            echo better-sqlite3 found, continuing installation...
            echo.
        ) else (
            echo.
            echo ERROR: better-sqlite3 could not be installed!
            echo.
            echo Solution 1: Install Visual Studio Build Tools
            echo   - https://visualstudio.microsoft.com/downloads/
            echo   - Select "Desktop development with C++" package
            echo.
            echo Solution 2: Install prebuilt binary
            echo   - npm install --save-optional better-sqlite3
            echo.
            pause
            exit /b 1
        )
    )
)

echo.
echo [4/4] Checking .env file...
echo ----------------------------------------
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo .env file created (from .env.example)
    ) else (
        echo .env.example not found
    )
) else (
    echo .env file already exists
)

echo.
echo [4/4] Setup completed successfully!
echo ----------------------------------------

echo.
echo ========================================
echo   Installation/Update Complete!      
echo ========================================
echo.
echo RSS-MCP v3.0 is ready to use!
echo.
echo To start the server:
echo    - Run START_SERVER.bat
echo    - OR: npm start
echo.
echo To update only, run this script again.
echo For more information, read README.md.
echo.
pause
