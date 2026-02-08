# .env Dosyasını Güncelleme Rehberi

## ✅ Tamamlanan İşlemler

`.env.example` dosyası başarıyla güncellendi:
- ✅ Eksik olan `MCP_TRANSPORT` değişkeni eklendi
- ✅ Tüm değişkenler için Türkçe açıklamalar eklendi
- ✅ Daha iyi organizasyon ve okunabilirlik sağlandı

## 📋 Environment Değişkenleri

Güncellenmiş `.env.example` dosyası şu değişkenleri içeriyor:

| Değişken | Default Değer | Açıklama |
|----------|---------------|----------|
| `PORT` | 3000 | HTTP server portu (http modunda) |
| `DB_PATH` | ./data/rss.db | SQLite database yolu |
| `MCP_TRANSPORT` | stdio | Transport modu (stdio/http) |
| `RATE_LIMIT_PER_DOMAIN` | 1 | Domain başına istek limiti |
| `MAX_REDIRECTS` | 3 | Maksimum redirect sayısı |
| `REQUEST_TIMEOUT` | 10000 | Request timeout (ms) |
| `LOG_LEVEL` | info | Log seviyesi |

## 🔧 .env Dosyasını Güncelleme

`.env` dosyanız gitignore tarafından korunduğu için, aşağıdaki komutla güncelleyebilirsiniz:

### Yöntem 1: Otomatik Kopyalama (Önerilen)

```powershell
Copy-Item .env.example .env -Force
```

### Yöntem 2: Manuel Düzenleme

1. `.env` dosyasını bir metin editörü ile açın
2. İçeriğini `.env.example` ile aynı yapın
3. Kaydedin

## ✅ Doğrulama

Güncellemeden sonra sunucuyu başlatarak test edin:

```powershell
# Projeyi derle
npm run build

# Sunucuyu başlat
npm start
```

Herhangi bir environment variable hatası olmamalı ve sunucu başarıyla başlamalıdır.

## 🎯 Sonuç

Artık tek bir `.env` dosyası ile hatasız çalışıyorsunuz:
- ✅ Tüm gerekli değişkenler mevcut
- ✅ Türkçe açıklamalar eklendi
- ✅ `.env.example` güncel ve eksiksiz
- ✅ Kod ile tam uyumlu
