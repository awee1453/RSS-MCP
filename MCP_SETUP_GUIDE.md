# RSS-MCP Kurulum Rehberi - AI Asistanları İçin

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Antigravity AI Kurulumu](#antigravity-ai-kurulumu)
3. [Trae AI Kurulumu](#trae-ai-kurulumu)
4. [Kullanılabilir RSS Araçları](#kullanılabilir-rss-araçları)
5. [Test ve Doğrulama](#test-ve-doğrulama)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

Bu rehber, RSS-MCP sunucusunu **Antigravity AI** ve **Trae AI** kod asistanlarına nasıl entegre edeceğinizi gösterir.

### RSS-MCP Nedir?

RSS-MCP, 26 profesyonel RSS aracı sunan bir Model Context Protocol (MCP) sunucusudur:
- 📰 RSS feed yönetimi
- 🔍 Gelişmiş haber arama ve filtreleme
- 📊 Analitik ve trend analizi
- 🌍 Otomatik çeviri (AI destekli)
- 🔐 Güvenilirlik değerlendirmesi
- ⚙️ Otomatik kategorize ve daha fazlası

---

## 🤖 Antigravity AI Kurulumu

### Adım 1: Config Dosyasını Kopyalayın

Hazır yapılandırma dosyasını Antigravity AI config dizinine kopyalayın:

```powershell
# Config dosyasını kopyala
Copy-Item "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP\configs\antigravity_rss_mcp_config.json" "c:\Users\site laptop2\.gemini\antigravity\mcp_config.json" -Force
```

### Adım 2: Config İçeriğini Doğrulayın

Config dosyası şu serverleri içermeli:

```json
{
  "mcpServers": {
    "rss-news": {
      "command": "node",
      "args": ["node_modules/tsx/dist/cli.mjs", "src/index.ts"],
      "cwd": "c:\\Users\\site laptop2\\Desktop\\Sil\\RSS-MCP-publish-professional-readme-ci\\RSS-MCP",
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    },
    "redis": { ... },
    "github-mcp-server": { ... }
  }
}
```

### Adım 3: Antigravity AI'ı Yeniden Başlatın

Config değişiklikleri yürürlüğe girmesi için Antigravity AI uygulamasını yeniden başlatın.

### Adım 4: RSS-MCP Sunucusunu Test Edin

Antigravity AI'da şu komutu deneyin:

```
RSS feedlerimi listele
```

veya

```
Use the rss_list tool to show all my RSS feeds
```

---

## 🎨 Trae AI Kurulumu

### Adım 1: Config Dosya Konumunu Bulun

Trae AI'ın MCP config dosyasının konumunu bulun. Genellikle:
- `%APPDATA%\Trae\mcp_config.json`
- veya `%USERPROFILE%\.trae\mcp_config.json`

### Adım 2: Config Dosyasını Kopyalayın veya Güncelleyin

**Yöntem 1: Doğrudan Kopyalama (Yeni Kurulum)**

```powershell
# Trae AI config dizinini bulun ve kopyalayın
Copy-Item "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP\configs\trae_ai_mcp_config.json" "%APPDATA%\Trae\mcp_config.json" -Force
```

**Yöntem 2: Manuel Ekleme (Mevcut Config Varsa)**

Mevcut Trae AI config dosyanıza şu server'ı ekleyin:

```json
{
  "mcpServers": {
    "rss-news": {
      "command": "node",
      "args": [
        "node_modules/tsx/dist/cli.mjs",
        "src/index.ts"
      ],
      "cwd": "c:\\Users\\site laptop2\\Desktop\\Sil\\RSS-MCP-publish-professional-readme-ci\\RSS-MCP",
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

### Adım 3: Trae AI'ı Yeniden Başlatın

Config değişikliklerinin yürürlüğe girmesi için Trae AI'ı kapatıp açın.

---

## 🛠️ Kullanılabilir RSS Araçları

RSS-MCP sunucusu **26 profesyonel araç** sunmaktadır:

### 📰 Temel Araçlar
| Araç | Açıklama |
|------|----------|
| `rss_add` | Yeni RSS feed ekle |
| `rss_list` | Tüm feedleri listele |
| `rss_update` | Feedleri güncelle |
| `rss_news` | Belirli feed'den haber getir |
| `rss_search` | Haberler içinde ara |
| `rss_delete` | Feed sil |

### 📊 Gelişmiş Analiz
| Araç | Açıklama |
|------|----------|
| `rss_breaking` | Son dakika haberleri |
| `rss_duplicates` | Mükerrer haberleri bul |
| `rss_analytics` | İstatistik ve analitik |
| `rss_trends` | Trend analizi |
| `rss_sentiment_analysis` | Duygu analizi |

### 🌍 İçerik & Çeviri
| Araç | Açıklama |
|------|----------|
| `rss_translate` | Haber çevir (AI destekli) |
| `rss_media` | Medya içeriği çıkar |
| `rss_full_content` | Tam içerik çek |

### 🔍 Karşılaştırma & Doğrulama
| Araç | Açıklama |
|------|----------|
| `rss_compare` | Feed karşılaştır |
| `rss_cross_verify` | Çapraz doğrulama |

### 💾 Dışa Aktarma
| Araç | Açıklama |
|------|----------|
| `rss_export` | JSON/CSV/XML export |
| `rss_daily_digest` | Günlük özet oluştur |
| `rss_opml` | OPML import/export |

### 🤖 Akıllı Özellikler
| Araç | Açıklama |
|------|----------|
| `rss_recommend` | Feed önerileri |
| `rss_auto_categorize` | Otomatik kategorize |
| `rss_credibility_score` | Güvenilirlik skoru |

### ⚙️ Yönetim & Takip
| Araç | Açıklama |
|------|----------|
| `rss_notification_setup` | Webhook bildirimleri |
| `rss_bookmark` | Bookmark yönetimi |
| `rss_schedule` | Otomatik güncelleme planla |
| `rss_health_monitor` | Feed sağlık izleme |

---

## ✅ Test ve Doğrulama

### Test 1: Basit Araç Kullanımı

AI asistanınızda şunu deneyin:

```
Bana mevcut RSS feedlerimi göster
```

Beklenen sonuç: Feed listesi veya "henüz feed eklenmedi" mesajı

### Test 2: Feed Ekleme

```
BBC News RSS feed'ini ekle: https://feeds.bbci.co.uk/news/rss.xml
```

### Test 3: Haber Arama

```
Son 24 saatteki teknoloji haberlerini ara
```

### Test 4: Analitik

```
Feed istatistiklerimi göster
```

---

## 🔧 Troubleshooting

### Problem: "RSS-MCP sunucusuna bağlanılamıyor"

**Çözüm 1:** Proje dizinini kontrol edin
```powershell
Test-Path "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP\src\index.ts"
```

**Çözüm 2:** Node.js ve bağımlılıkları kontrol edin
```powershell
cd "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP"
npm install
```

**Çözüm 3:** Manuel sunucu başlatma testi
```powershell
cd "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP"
npm start
```

### Problem: "Config dosyası geçersiz"

**Çözüm:** JSON syntax'ını doğrulayın
```powershell
Get-Content "c:\Users\site laptop2\.gemini\antigravity\mcp_config.json" | ConvertFrom-Json
```

Hata yoksa "Object" dönmelidir.

### Problem: "Araçlar görünmüyor"

**Çözüm 1:** AI asistanını tamamen kapatıp açın

**Çözüm 2:** Config dosyasındaki `cwd` yolunu kontrol edin - Windows için `\\` kullanılmalı

**Çözüm 3:** Sunucu loglarını kontrol edin
```powershell
# Manuel başlatıp hata mesajlarını görün
cd "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP"
node node_modules/tsx/dist/cli.mjs src/index.ts
```

### Problem: "Database hatası"

**Çözüm:** Database dizininin var olduğundan emin olun
```powershell
cd "c:\Users\site laptop2\Desktop\Sil\RSS-MCP-publish-professional-readme-ci\RSS-MCP"
mkdir -Force data
```

---

## 📝 Örnek Kullanım Senaryoları

### Senaryo 1: Günlük Haber Takibi

```
1. "BBC News ve CNN feedlerini ekle"
2. "Feedlerimi güncelle"
3. "Son 24 saatteki tüm haberleri göster"
4. "Günlük özet oluştur"
```

### Senaryo 2: Belirli Konu Takibi

```
1. "Teknoloji feedleri öner"
2. "AI ve yapay zeka ile ilgili haberleri ara"
3. "Benzer haberleri grupla"
4. "Trend analizi yap"
```

### Senaryo 3: Çoklu Kaynak Doğrulama

```
1. "Ukrayna ile ilgili haberleri getir"
2. "Bu haberleri farklı kaynaklarda çapraz doğrula"
3. "Kaynak güvenilirlik skorlarını göster"
```

---

## 🎓 İleri Seviye Özellikler

### Otomatik Güncelleme

```
"BBC News feed'i için her saat otomatik güncelleme planla"
```

### Webhook Bildirimleri

```
"'Bitcoin' kelimesi geçen haberler için webhook bildirimi ayarla"
```

### Sentiment Analizi

```
"Son 7 gündeki ekonomi haberlerinin duygu analizini yap"
```

### OPML İle Toplu Feed Yönetimi

```
"Tüm feedlerimi OPML formatında dışa aktar"
```

---

## 📞 Destek

Sorun yaşarsanız:
1. ✅ Bu rehberdeki Troubleshooting bölümünü kontrol edin
2. ✅ Config dosyalarını yeniden oluşturun
3. ✅ Sunucuyu manuel başlatıp hata loglarını inceleyin
4. ✅ `.env` dosyasının doğru yapılandırıldığından emin olun

---

## 🎉 Tebrikler!

RSS-MCP artık AI asistanınızla entegre! 26 profesyonel RSS aracıyla haberleri takip edebilir, analiz edebilir ve yönetebilirsiniz.

**Sonraki Adımlar:**
- İlk RSS feed'lerinizi ekleyin
- Otomatik güncelleme ayarlayın
- Trend analizi yapın
- Günlük özet raporları oluşturun
