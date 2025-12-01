# RSS-MCP v3.0: 13 Yeni Tool + Otomatik Güncelleme Sistemi

## 🎉 Yenilikler

### v3.0 - Major Update (2025-12-01)

#### 🚀 13 Yeni Profesyonel Tool Eklendi

**Bildirim & Otomasyon:**
- `rss_notification_setup` - Webhook bildirimleri (keyword filtering)
- `rss_schedule` - Otomatik feed güncellemeleri (cron desteği)

**Gelişmiş Analiz:**
- `rss_trends` - Trending konular ve NLP analizi
- `rss_sentiment_analysis` - Duygu analizi (pozitif/negatif/nötr)

**Akıllı Özellikler:**
- `rss_recommend` - AI tabanlı feed önerileri
- `rss_auto_categorize` - Otomatik kategorileme
- `rss_credibility_score` - Feed güvenilirlik skorlaması

**İçerik & Dışa Aktarma:**
- `rss_daily_digest` - Günlük/haftalık özet raporlar (HTML/Markdown)
- `rss_opml` - OPML import/export (feed migration)

**İçerik Keşfi:**
- `rss_full_content` - Tam makale çıkarma (web scraping)
- `rss_cross_verify` - Çapraz kaynak doğrulama

**Organizasyon:**
- `rss_bookmark` - Reading list (tags, notes)
- `rss_health_monitor` - Feed sağlık izleme

#### 🔄 Otomatik Güncelleme Sistemi

**Windows:**
- `START_SERVER.bat` - Otomatik kütüphane güncellemeli başlatma
- `FIRST_TIME_SETUP.bat` - İlk kurulum scripti

**Linux/Mac:**
- `start_server.sh` - Cross-platform otomatik güncelleme

**NPM Komutları:**
```bash
npm run auto-start        # Güncelle + Başlat
npm run quick-start       # İlk kurulum + Başlat
npm run setup             # Sadece kur
npm run update-deps       # Manuel güncelleme
```

#### 📦 Yeni Teknolojiler

- `cheerio` - Web scraping
- `sentiment` - NLP sentiment analysis
- `cron-parser` - Scheduling
- `fast-xml-parser` - OPML support
- `node-cron` - Cron jobs

#### 🗄️ Database Güncellemeleri

6 yeni tablo:
- `notifications` - Webhook konfigürasyonları
- `bookmarks` - Kullanıcı reading lists
- `schedules` - Otomatik güncelleme zamanları
- `credibility_scores` - Feed güvenilirlik metrikleri
- `health_metrics` - Feed performans takibi
- `sentiment_cache` - Sentiment analiz cache

## 🚀 Hızlı Başlangıç

### İlk Kurulum
```bash
# Windows
FIRST_TIME_SETUP.bat

# Linux/Mac
npm run setup
chmod +x start_server.sh
```

### Normal Kullanım (Otomatik Güncelleme)
```bash
# Windows
START_SERVER.bat

# Linux/Mac
./start_server.sh
# VEYA
npm run auto-start
```

## 📊 İstatistikler

- **Toplam Tool Sayısı**: 26 (13 eski + 13 yeni)
- **Servis Katmanları**: 22
- **Database Tabloları**: 11
- **Desteklenen Format**: JSON, CSV, XML, HTML, Markdown, OPML
- **AI Özellikleri**: Sentiment, Trends, Recommendations, Categorization

## 📚 Dokümantasyon

- [AUTO_UPDATE_GUIDE.md](AUTO_UPDATE_GUIDE.md) - Otomatik güncelleme sistemi
- [MCP_CLIENT_GUIDE.md](MCP_CLIENT_GUIDE.md) - MCP client kurulumu
- [KURULUM_REHBERI.md](KURULUM_REHBERI.md) - Detaylı kurulum
- [README.md](README.md) - Genel bilgiler

## 🔗 Bağlantılar

- **Server URL**: `http://localhost:3000/mcp`
- **Health Check**: `http://localhost:3000/health`
- **MCP Inspector**: `npx @modelcontextprotocol/inspector`

## 🎯 Kullanım Örnekleri

### Trend Analizi
```javascript
// Son 7 gündeki trending konular
rss_trends({ days: 7, limit: 20 })
```

### Sentiment Analizi
```javascript
// Feed'deki haberlerin duygu analizi
rss_sentiment_analysis({ feed_id: "abc123", days: 7 })
```

### OPML Export
```javascript
// Tüm feedleri dışa aktar
rss_opml({ action: "export", categorized: true })
```

### Otomatik Güncelleme
```javascript
// Her 6 saatte bir otomatik güncelle
rss_schedule({ 
  action: "create",
  feed_id: "abc123",
  preset: "Every 6 hours"
})
```

## 🛠️ Geliştirme

```bash
npm run dev           # Development mode (watch)
npm run dev:http      # HTTP transport development
npm run build         # TypeScript build
npm run clean         # Temizlik
```

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce issue açarak tartışın.

---

**RSS-MCP v3.0** - Professional RSS Feed Management with AI 🚀
