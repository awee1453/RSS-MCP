@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════╗
echo ║   RSS-MCP v3.0 Otomatik Başlatıcı     ║
echo ╚════════════════════════════════════════╝
echo.

REM Proje dizinine git
cd /d "%~dp0"

echo [1/3] 📦 Kütüphaneler güncelleniyor...
echo ────────────────────────────────────────
npm update
if errorlevel 1 (
    echo.
    echo ❌ HATA: Kütüphane güncellemesi başarısız!
    echo 💡 İpucu: İnternet bağlantınızı kontrol edin.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] ✅ Kütüphaneler güncellendi!
echo ────────────────────────────────────────
echo.

echo [3/3] 🚀 RSS-MCP Server başlatılıyor...
echo ────────────────────────────────────────
echo.

REM Serveri başlat
npm start

if errorlevel 1 (
    echo.
    echo ❌ HATA: Server başlatılamadı!
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════╗
echo ║  Server başarıyla çalışıyor! ✅        ║
echo ╚════════════════════════════════════════╝
echo.
echo 🔗 URL: http://localhost:3000/mcp
echo 📊 Health: http://localhost:3000/health
echo.
echo ⚠️  Bu pencereyi KAPATMAYIN!
echo    Server çalışırken bu pencere açık kalmalı.
echo.
pause
