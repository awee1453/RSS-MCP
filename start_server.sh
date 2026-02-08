#!/bin/bash

# RSS-MCP v3.0 Otomatik Başlatıcı (Linux/Mac)
# UTF-8 encoding

echo "╔════════════════════════════════════════╗"
echo "║   RSS-MCP v3.0 Otomatik Başlatıcı     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Proje dizinine git
cd "$(dirname "$0")"

echo "[1/3] 📦 Kütüphaneler güncelleniyor..."
echo "────────────────────────────────────────"
npm update
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ HATA: Kütüphane güncellemesi başarısız!"
    echo "💡 İpucu: İnternet bağlantınızı kontrol edin."
    echo ""
    read -p "Devam etmek için bir tuşa basın..."
    exit 1
fi

echo ""
echo "[2/3] ✅ Kütüphaneler güncellendi!"
echo "────────────────────────────────────────"
echo ""

echo "[3/3] 🚀 RSS-MCP Server başlatılıyor..."
echo "────────────────────────────────────────"
echo ""

# Serveri başlat
npm start

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ HATA: Server başlatılamadı!"
    echo ""
    read -p "Devam etmek için bir tuşa basın..."
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  Server başarıyla çalışıyor! ✅        ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🔗 URL: http://localhost:3000/mcp"
echo "📊 Health: http://localhost:3000/health"
echo ""
echo "⚠️  Bu terminal penceresini KAPATMAYIN!"
echo "   Server çalışırken bu pencere açık kalmalı."
echo ""
read -p "Kapatmak için Ctrl+C basın..."
