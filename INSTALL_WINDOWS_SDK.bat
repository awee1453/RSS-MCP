@echo off
echo ========================================
echo   Windows SDK Installation Helper    
echo ========================================
echo.
echo This file will open Visual Studio Installer
echo to start Windows SDK installation.
echo.
echo STEPS:
echo 1. Visual Studio Installer will open
echo 2. Click "Modify" button
echo 3. Go to "Individual components" tab
echo 4. Check the following box:
echo    [X] Windows 10 SDK (10.0.22621.0)
echo    OR a newer version
echo 5. Click "Modify" button
echo 6. After installation completes, run FIRST_TIME_SETUP.bat again
echo.
pause

REM Open Visual Studio Installer
echo.
echo Opening Visual Studio Installer...
echo.

start "" "C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe"

echo.
echo Visual Studio Installer opened!
echo Follow the steps above.
echo.
pause
