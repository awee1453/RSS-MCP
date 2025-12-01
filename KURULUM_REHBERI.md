# RSS MCP Kurulum Rehberi - Kod Bilmeyenler İçin

## 🎯 Nedir Bu?

RSS MCP, haber kaynaklarını AI asistanlarınıza (Claude, GitHub Copilot, vb.) bağlayan bir araçtır. Kurulum sonrası AI asistanınıza "BBC haberlerini göster" diyebilirsiniz!

---

## 📋 Gereksinimler

Sadece bunlar yüklü olmalı:
- ✅ **Node.js** (v18 veya üzeri) - [İndir](https://nodejs.org)
- ✅ Bir AI asistan (Claude Desktop, VS Code, Cursor, vb.)

---

## ⚡ Hızlı Kurulum (3 Adım)

### Adım 1: Dosyaları Hazırla

1. `RSSMCP` klasörünü masaüstünüze kopyalayın
2. Klasörün içinde şunlar olmalı:
   - `src` klasörü
   - `package.json` dosyası
   - `README.md` dosyası

### Adım 2: Programı Başlat

**Windows için**:
1. `RSSMCP` klasörüne sağ tıklayın
2. "Terminal'de Aç" veya "PowerShell'de Aç" seçin
3. Şu komutu yazın:
   ```
   npm install
   ```
4. Bekleyin (1-2 dakika sürer)
5. Sonra şunu yazın:
   ```
   npm start
   ```
6. ✅ Yeşil onay işareti görürseniz hazır!

**Mac/Linux için**:
1. Terminal'i açın
2. Şu komutu yazın:
   ```
   cd ~/Desktop/RSSMCP
   npm install
   npm start
   ```

### Adım 3: AI Asistanınıza Bağlayın

Aşağıdan AI asistanınızı seçin ve talimatları izleyin ⬇️

---

## 🤖 Claude Desktop Kurulumu

### Windows

1. **Dosya Gezgini'ni Açın**
2. Adres çubuğuna yazın ve Enter'a basın:
   ```
   %APPDATA%\Claude
   ```
3. `claude_desktop_config.json` dosyasını bulun
   - Yoksa: Not Defteri'nde yeni dosya oluşturun, adını `claude_desktop_config.json` yapın
4. Dosyayı Not Defteri ile açın
5. **Aşağıdaki kodu kopyalayıp yapıştırın**:

```json
{
  "mcpServers": {
    "rss-news": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

6. Dosyayı kaydedin (Ctrl+S)
7. Claude Desktop'ı **tamamen kapatın** ve yeniden açın

### Mac

1. **Finder'ı Açın**
2. Menüden: Git → Klasöre Git
3. Şunu yazın:
   ```
   ~/Library/Application Support/Claude
   ```
4. `claude_desktop_config.json` dosyasını TextEdit ile açın
   - Yoksa: Yeni dosya oluşturun
5. **Aşağıdaki kodu kopyalayıp yapıştırın**:

```json
{
  "mcpServers": {
    "rss-news": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

6. Kaydedin
7. Claude Desktop'ı yeniden başlatın

### ✅ Test Edin

Claude'a şunu yazın:
```
BBC News feed'ini ekle: https://feeds.bbci.co.uk/news/rss.xml
```

---

## 💻 VS Code (GitHub Copilot) Kurulumu

### Yöntem 1: Ayarlar Menüsünden

1. VS Code'u açın
2. `Ctrl + ,` (Windows) veya `Cmd + ,` (Mac) basın
3. Sağ üstteki **dosya simgesine** tıklayın (settings.json)
4. **Aşağıdaki kodu ekleyin**:

```json
{
  "github.copilot.mcp.servers": {
    "rss-news": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

5. Dosyayı kaydedin (Ctrl+S)
6. VS Code'u yeniden başlatın

### Yöntem 2: Komut ile (Daha Kolay)

1. VS Code'da Terminal açın (Ctrl + `)
2. Şunu yapıştırın:

**Windows**:
```powershell
code --add-mcp "{\"name\":\"rss-news\",\"type\":\"http\",\"url\":\"http://localhost:3000/mcp\"}"
```

**Mac/Linux**:
```bash
code --add-mcp '{"name":"rss-news","type":"http","url":"http://localhost:3000/mcp"}'
```

---

## 🖱️ Cursor IDE Kurulumu

### Yöntem 1: Ayarlardan

1. Cursor'u açın
2. `Cmd/Ctrl + ,` basın (Ayarlar)
3. "MCP" yazın arama kutusuna
4. "MCP Servers" bölümünü bulun
5. **Add Server** tıklayın
6. Şu bilgileri girin:
   - **Name**: `rss-news`
   - **Type**: `HTTP`
   - **URL**: `http://localhost:3000/mcp`
7. Save tıklayın

### Yöntem 2: Config Dosyası

1. Cursor ayarlar dosyasını açın:
   - Windows: `%APPDATA%\Cursor\User\settings.json`
   - Mac: `~/Library/Application Support/Cursor/User/settings.json`
2. **Aşağıdaki kodu ekleyin**:

```json
{
  "mcp.servers": {
    "rss-news": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

3. Kaydedin ve Cursor'u yeniden başlatın

---

## 🧪 Test Etme

### MCP Inspector ile Test (Önerilen)

1. Terminal/PowerShell açın
2. Şunu yazın:
   ```
   npx @modelcontextprotocol/inspector
   ```
3. Tarayıcıda açılacak
4. **Transport**: "Streamable HTTP" seçin
5. **URL**: `http://localhost:3000/mcp` yazın
6. **Connect** tıklayın
7. Sol tarafta 13 tool görmelisiniz ✅

### Claude ile Test

Claude'a şunları deneyin:
```
1. "BBC News feed'ini ekle"
2. "Kayıtlı feedleri göster"
3. "Son haberleri getir"
4. "Teknoloji haberlerini ara"
5. "Bu makaleyi Türkçe'ye çevir"
```

---

## 🎮 Kullanım Örnekleri

### Basit Komutlar

```
✅ "Al Jazeera Arabic feed'ini ekle"
✅ "Tüm feedleri göster"
✅ "Feedleri güncelle"
✅ "Son 10 haberi göster"
✅ "Son dakika haberlerini getir"
✅ "Teknoloji kategorisindeki haberleri ara"
✅ "Bu makaleyi Kürtçe'ye çevir"
✅ "Mükerrer haberleri bul"
✅ "Son 7 günün analitiklerini göster"
✅ "Haberleri CSV olarak dışa aktar"
```

### Gelişmiş Kullanım

**Arapça Haber Ekle ve Çevir**:
```
1. "Al Jazeera feed'ini ekle: https://www.aljazeera.net/xml/rss/all.xml"
2. "Feedleri güncelle"
3. "Son 5 haberi göster"
4. "İlk haberi Türkçe'ye çevir"
```

**Analitik Rapor**:
```
"Son 7 günün analitiklerini göster - hangi kategoriler popüler?"
```

**Feed Karşılaştırma**:
```
"BBC ve CNN feedlerini karşılaştır - hangi konuları ortak kapsıyorlar?"
```

---

## ❓ Sorun Giderme

### "Server başlamıyor"

**Çözüm 1**: Port zaten kullanımda
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /F /PID [görünen numara]

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Çözüm 2**: Node.js güncel değil
- Node.js'i yeniden indirin: https://nodejs.org

### "Claude bağlanmıyor"

1. JSON dosyasında **virgül hatası** var mı kontrol edin
2. Claude'u **tamamen kapatıp** açın (sistem tepsisinden de)
3. Server çalışıyor mu kontrol edin:
   - Tarayıcıda açın: http://localhost:3000/health
   - "ok" görmelisiniz

### "Tool'lar görünmüyor"

1. Server'ı yeniden başlatın:
   - Terminal'de `Ctrl+C` basın
   - `npm start` yazın
2. AI asistanını yeniden başlatın
3. 30 saniye bekleyin

---

## 🔄 Server'ı Her Zaman Çalıştırma

### Windows - Başlangıçta Otomatik Başlat

1. `start-rss-mcp.bat` dosyası oluşturun:
```batch
@echo off
cd C:\Users\[KULLANICI_ADINIZ]\Desktop\RSSMCP
npm start
```

2. Bu dosyayı şuraya kopyalayın:
   ```
   %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
   ```

### Mac - Başlangıçta Otomatik Başlat

1. `start-rss-mcp.sh` dosyası oluşturun:
```bash
#!/bin/bash
cd ~/Desktop/RSSMCP
npm start
```

2. Terminal'de:
```bash
chmod +x start-rss-mcp.sh
```

3. Sistem Ayarları → Kullanıcılar ve Gruplar → Giriş Öğeleri → + → Dosyayı seçin

---

## 📊 Özellikler

### 13 Güçlü Araç

| Araç | Ne İşe Yarar |
|------|--------------|
| `rss_add` | Yeni haber kaynağı ekle |
| `rss_list` | Kayıtlı kaynakları göster |
| `rss_update` | Haberleri güncelle |
| `rss_news` | Haberleri oku |
| `rss_search` | Haber ara |
| `rss_breaking` | Son dakika haberleri |
| `rss_duplicates` | Tekrar eden haberleri bul |
| `rss_translate` | Haberleri çevir (AI ile) |
| `rss_media` | Görselleri çıkar |
| `rss_analytics` | İstatistikleri göster |
| `rss_export` | Dosyaya aktar |
| `rss_compare` | Kaynakları karşılaştır |
| `rss_delete` | Kaynak sil |

### Desteklenen Diller

Çeviri için: Türkçe, İngilizce, Arapça, Kürtçe, Farsça, İbranice, İspanyolca, Fransızca, Almanca, İtalyanca, Portekizce, Rusça, Çince, Japonca, Korece

---

## 💡 İpuçları

1. **Server her zaman açık olmalı** - Kapatırsanız AI asistan bağlanamaz
2. **İlk kullanımda** feedleri güncelleyin: "Feedleri güncelle"
3. **Arapça haberler** otomatik sağdan sola görünür
4. **Çeviriler** cache'lenir - aynı makale tekrar çevrilmez
5. **Export** özelliği ile haberleri Excel'e aktarabilirsiniz

---

## 🆘 Destek

Sorun mu yaşıyorsunuz?

1. **Health Check**: http://localhost:3000/health açın
   - "ok" görmelisiniz
2. **Log'lara Bakın**: Terminal penceresinde hata var mı?
3. **Yeniden Başlatın**: Server'ı kapatıp açın

---

## ✅ Kurulum Tamamlandı!

Artık AI asistanınız haber okuyabilir! 🎉

**İlk Komutunuz**:
```
"BBC News feed'ini ekle ve son haberleri göster"
```
