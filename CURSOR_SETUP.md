# Cursor IDE - RSS MCP Kurulum Rehberi

Bu rehber, Cursor IDE'de `@rss-news` MCP'sini kullanmak için adım adım talimatlar içerir.

## 🎯 Hızlı Kurulum (Önerilen)

### Adım 1: Cursor Ayarlarını Açın

1. Cursor'u açın
2. `Ctrl + ,` (Windows) veya `Cmd + ,` (Mac) tuşlarına basın
3. Arama kutusuna "MCP" yazın
4. "MCP Servers" bölümünü bulun

### Adım 2: MCP Sunucusunu Ekleyin

1. **"Add Server"** veya **"+"** butonuna tıklayın
2. Şu bilgileri girin:
   - **Name**: `rss-news`
   - **Type**: `stdio` veya `command`
   - **Command**: `node`
   - **Args**: `["node_modules/tsx/dist/cli.mjs", "src/index.ts"]`
  - **Working Directory**: `/path/to/RSS-MCP`

3. **Save** butonuna tıklayın

### Adım 3: Cursor'u Yeniden Başlatın

Cursor'u tamamen kapatıp yeniden açın.

## ✅ Test Etme

Cursor'da chat panelinde şunu yazın:

```
@rss-news feedleri listele
```

Eğer MCP düzgün çalışıyorsa, feed listesi görünecektir.

## 🔧 Manuel Yapılandırma (Config Dosyası)

Eğer UI'dan yapılandıramazsanız, config dosyasını doğrudan düzenleyebilirsiniz:

### Windows
```
%APPDATA%\Cursor\User\settings.json
```

### macOS
```
~/Library/Application Support/Cursor/User/settings.json
```

### Linux
```
~/.config/Cursor/User/settings.json
```

Config dosyasına şunu ekleyin:

```json
{
  "mcp.servers": {
    "rss-news": {
      "command": "node",
      "args": [
        "node_modules/tsx/dist/cli.mjs",
        "src/index.ts"
      ],
      "cwd": "/path/to/RSS-MCP"
    }
  }
}
```

**Önemli**: `cwd` yolunu kendi proje dizininize göre güncelleyin!

## 📝 Kullanım Örnekleri

Cursor chat'inde `@rss-news` kullanarak:

```
@rss-news feedleri listele
@rss-news son 5 haber başlığını listele
@rss-news feedleri güncelle
@rss-news BBC News feed ekle: https://feeds.bbci.co.uk/news/rss.xml
@rss-news teknoloji haberlerini ara
```

## ❌ Sorun Giderme

### MCP Araçları Görünmüyor

1. Cursor'u tamamen kapatıp yeniden açın
2. `cwd` yolunun doğru olduğundan emin olun
3. Node.js ve tsx'in yüklü olduğunu kontrol edin:
   ```bash
   node --version
   npm list tsx
   ```

### "Command not found" Hatası

- `cwd` yolunun proje dizininize işaret ettiğinden emin olun
- `node_modules/tsx/dist/cli.mjs` dosyasının var olduğunu kontrol edin
- Gerekirse: `npm install`

### MCP Bağlantı Hatası

- Cursor'u yeniden başlatın
- Config dosyasındaki JSON syntax'ını kontrol edin
- Cursor'un MCP log'larını kontrol edin (Settings > MCP > View Logs)

## 🔄 HTTP Modu (Alternatif)

Eğer stdio modu çalışmazsa, HTTP modunu deneyebilirsiniz:

1. Terminal'de sunucuyu başlatın:
   ```bash
   npm run dev:http
   ```

2. Cursor Settings'te:
   - Type: `HTTP`
   - URL: `http://localhost:3000/mcp`

**Not**: HTTP modunda sunucuyu manuel olarak başlatmanız gerekir.

## 💡 İpuçları

- stdio modu önerilir çünkü Cursor otomatik olarak sunucuyu başlatır
- `@rss-news` yazdıktan sonra boşluk bırakın, Cursor otomatik tamamlama gösterecektir
- MCP araçları Cursor'un chat panelinde kullanılabilir

