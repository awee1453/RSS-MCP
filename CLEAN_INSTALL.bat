@echo off
chcp 65001 > nul
echo ========================================
echo   Clean Installation                  
echo ========================================
echo.
echo This script will delete node_modules and package-lock.json
echo and perform a clean installation.
echo.
echo WARNING: better-sqlite3 error may persist,
echo but all other packages will be installed.
echo.
pause

REM Navigate to project directory
cd /d "%~dp0"

echo.
echo [1/3] Cleaning old files...
echo ----------------------------------------

REM Delete package-lock.json if exists
if exist "package-lock.json" (
    echo Deleting package-lock.json...
    del /f /q "package-lock.json"
)

REM Delete node_modules if exists
if exist "node_modules" (
    echo Deleting node_modules (this may take a while)...
    rmdir /s /q "node_modules" 2>nul
    
    REM Check again
    if exist "node_modules" (
        echo.
        echo WARNING: node_modules could not be completely deleted!
        echo Some files may be locked.
        echo.
        echo Please:
        echo 1. Close all open editor and terminal windows
        echo 2. Delete node_modules folder manually
        echo 3. Run this script again
        echo.
        pause
        exit /b 1
    )
)

echo Cleanup completed!

echo.
echo [2/3] Installing packages (with --force)...
echo ----------------------------------------
echo.
echo This may take a few minutes...
echo better-sqlite3 may error but other packages will install.
echo.

REM Install with force
call npm install --force

echo.
echo [3/3] Checking installation status...
echo ----------------------------------------

REM Check boolbase
if exist "node_modules\boolbase" (
    echo [OK] boolbase found
) else (
    echo [ERROR] boolbase not found!
)

REM Check express
if exist "node_modules\express" (
    echo [OK] express found
) else (
    echo [ERROR] express not found!
)

REM Check tsx
if exist "node_modules\tsx" (
    echo [OK] tsx found
) else (
    echo [ERROR] tsx not found!
)

REM Check better-sqlite3
if exist "node_modules\better-sqlite3" (
    echo [OK] better-sqlite3 found
) else (
    echo [WARNING] better-sqlite3 not found (Windows SDK required)
)

echo.
echo ========================================
echo   Installation Complete!             
echo ========================================
echo.
echo To test the server:
echo   npm start
echo.
echo If better-sqlite3 error persists:
echo   Run INSTALL_WINDOWS_SDK.bat
echo.
pause
