@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════╗
echo ║   RSS-MCP v3.0 İlk Kurulum            ║
echo ╚════════════════════════════════════════╝
echo.
echo Bu script ilk kurulum için tüm bağımlılıkları
echo yükleyecek ve yapılandırmayı tamamlayacak.
echo.
pause

REM Proje dizinine git
cd /d "%~dp0"

echo.
echo [1/4] 📦 Node.js sürümü kontrol ediliyor...
echo ────────────────────────────────────────
node --version
if errorlevel 1 (
    echo.
    echo ❌ HATA: Node.js bulunamadı!
    echo 💡 Lütfen Node.js 18+ yükleyin: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] 📥 Tüm bağımlılıklar yükleniyor...
echo ────────────────────────────────────────
echo Bu işlem birkaç dakika sürebilir...
echo.
npm install
if errorlevel 1 (
    echo.
    echo ❌ HATA: Bağımlılık yüklemesi başarısız!
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] 🔄 Kütüphaneler en son versiyona güncelleniyor...
echo ────────────────────────────────────────
npm update

echo.
echo [4/4] 📝 .env dosyası kontrol ediliyor...
echo ────────────────────────────────────────
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ .env dosyası oluşturuldu (.env.example'dan)
    ) else (
        echo ⚠️  .env.example bulunamadı
    )
) else (
    echo ✅ .env dosyası zaten mevcut
)

echo.
echo ╔════════════════════════════════════════╗
echo ║  Kurulum Tamamlandı! ✅                ║
echo ╚════════════════════════════════════════╝
echo.
echo RSS-MCP v3.0 kullanıma hazır!
echo.
echo 🚀 Serveri başlatmak için:
echo    - START_SERVER.bat dosyasını çalıştırın
echo    - VEYA: npm run auto-start
echo.
echo 📚 Daha fazla bilgi için README.md dosyasını okuyun.
echo.
pause
