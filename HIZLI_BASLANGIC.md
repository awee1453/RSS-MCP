# RSS MCP - Hızlı Başlangıç

## 🚀 3 Adımda Başla

### 1️⃣ Server'ı Başlat

**Windows**: `START_SERVER.bat` dosyasına çift tıkla  
**Mac/Linux**: Terminal'de `./start_server.sh`

### 2️⃣ AI Asistanını Ayarla

**Claude Desktop**:
- `configs/claude_desktop_config.json` dosyasını kopyala
- Şuraya yapıştır: `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
- Claude'u yeniden başlat

**VS Code**:
- `configs/vscode_settings.json` içeriğini kopyala
- VS Code Ayarlar → settings.json'a yapıştır

**Cursor**:
- `configs/cursor_settings.json` içeriğini kopyala
- Cursor Ayarlar → settings.json'a yapıştır

### 3️⃣ Test Et

AI asistanına yaz:
```
BBC News feed'ini ekle: https://feeds.bbci.co.uk/news/rss.xml
```

---

## 📝 Popüler RSS Feedleri

### Türkçe
- **Hürriyet**: `https://www.hurriyet.com.tr/rss/anasayfa`
- **Sözcü**: `https://www.sozcu.com.tr/feed/`
- **NTV**: `https://www.ntv.com.tr/gundem.rss`

### İngilizce
- **BBC News**: `https://feeds.bbci.co.uk/news/rss.xml`
- **CNN**: `http://rss.cnn.com/rss/edition.rss`
- **TechCrunch**: `https://techcrunch.com/feed/`
- **Hacker News**: `https://hnrss.org/frontpage`

### Arapça
- **Al Jazeera**: `https://www.aljazeera.net/xml/rss/all.xml`
- **BBC Arabic**: `http://feeds.bbci.co.uk/arabic/rss.xml`
- **Al Arabiya**: `https://www.alarabiya.net/ar.xml`

### Kürtçe
- **Rudaw**: `https://www.rudaw.net/rss`

---

## 💬 Örnek Komutlar

```
✅ "Tüm feedleri göster"
✅ "Feedleri güncelle"
✅ "Son 10 haberi göster"
✅ "Son dakika haberlerini getir"
✅ "Teknoloji haberlerini ara"
✅ "Bu makaleyi Türkçe'ye çevir"
✅ "Son 7 günün analitiklerini göster"
✅ "Mükerrer haberleri bul"
✅ "Haberleri CSV olarak dışa aktar"
```

---

## 🔧 Sorun mu var?

1. **Server çalışıyor mu?**
   - Tarayıcıda aç: http://localhost:3000/health
   - "ok" görmelisin

2. **AI asistan bağlanmıyor?**
   - JSON dosyasını kontrol et (virgül hatası olabilir)
   - AI asistanını yeniden başlat

3. **Port zaten kullanımda?**
   ```powershell
   # Windows
   netstat -ano | findstr :3000
   taskkill /F /PID [numara]
   ```

---

## 📚 Detaylı Bilgi

- **Tam Kurulum**: `KURULUM_REHBERI.md`
- **Teknik Detaylar**: `README.md`
- **MCP Client Guide**: `MCP_CLIENT_GUIDE.md`

---

**Server URL**: `http://localhost:3000/mcp`  
**Health Check**: `http://localhost:3000/health`  
**Tool Sayısı**: 13
