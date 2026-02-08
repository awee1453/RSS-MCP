# RSS-MCP v3.0 - Otomatik Başlatma Sistemi

## 🚀 Hızlı Başlangıç

RSS-MCP artık **otomatik kütüphane güncelleme** özelliği ile geliyor!

### Windows Kullanıcıları

**İlk Kurulum:**
```bash
# İlk kez kurulum yapıyorsanız
FIRST_TIME_SETUP.bat
```

**Normal Başlatma (Otomatik Güncelleme ile):**
```bash
# Her seferinde kütüphaneleri günceller ve serveri başlatır
START_SERVER.bat
```

### Linux/Mac Kullanıcıları

**İlk Kurulum:**
```bash
chmod +x start_server.sh
npm run setup
```

**Normal Başlatma (Otomatik Güncelleme ile):**
```bash
./start_server.sh
# VEYA
npm run auto-start
```

## 📦 Yeni NPM Komutları

### Otomatik Güncelleme ve Başlatma
```bash
npm run auto-start        # Kütüphaneleri güncelle + Serveri başlat (stdio mode)
npm run auto-start:http   # Kütüphaneleri güncelle + HTTP modunda başlat
```

### İlk Kurulum
```bash
npm run setup             # Tüm bağımlılıkları yükle
npm run quick-start       # Yükle + Başlat (ilk kez için)
```

### Manuel Güncelleme
```bash
npm run update-deps       # Kütüphaneleri güncelle + Versiyon kontrolü
npm update                # Sadece güncelle
npm outdated              # Güncel olmayan paketleri göster
```

### Standart Başlatma (Güncelleme olmadan)
```bash
npm start                 # Normal başlatma
npm run dev               # Development mode (watch)
npm run start:http        # HTTP transport mode
```

## ✨ Özellikler

### START_SERVER.bat (Windows)
- ✅ Otomatik kütüphane güncellemesi
- ✅ Profesyonel Unicode arayüz
- ✅ Hata kontrolü ve kullanıcı dostu mesajlar
- ✅ Adım adım ilerleme göstergesi
- ✅ Internet bağlantı kontrolü

### start_server.sh (Linux/Mac)
- ✅ Tüm platformlarda çalışır
- ✅ Bash script ile otomatik güncelleme
- ✅ Hata yönetimi
- ✅ UTF-8 desteği

### FIRST_TIME_SETUP.bat
- ✅ İlk kurulum için özel script
- ✅ Node.js versiyon kontrolü
- ✅ Tüm bağımlılıkları otomatik yükleme
- ✅ .env dosyası oluşturma
- ✅ Kütüphane güncelleme

## 🔄 Çalışma Akışı

### START_SERVER.bat çalıştırıldığında:

```
[1/3] 📦 Kütüphaneler güncelleniyor...
      └─ npm update komutu çalışır
      └─ Tüm paketler en son versiyona güncellenir

[2/3] ✅ Kütüphaneler güncellendi!
      └─ Güncelleme başarılı

[3/3] 🚀 RSS-MCP Server başlatılıyor...
      └─ Server stdio modunda başlar
      └─ 26 tool yüklenir
```

## 🎯 Kullanım Senaryoları

### Senaryo 1: İlk Kez Kurulum
1. `FIRST_TIME_SETUP.bat` çalıştır
2. Bekle (birkaç dakika sürebilir)
3. `START_SERVER.bat` ile serveri başlat

### Senaryo 2: Günlük Kullanım
1. `START_SERVER.bat` çalıştır
2. Otomatik günceller ve başlatır
3. Çalışmaya başla!

### Senaryo 3: Manuel Kontrol
```bash
npm outdated              # Hangi paketler güncel değil?
npm run update-deps       # Güncelle ve göster
npm start                 # Güncelleme olmadan başlat
```

## ⚡ Performans Notları

- **İlk çalıştırma**: ~2-5 dakika (tüm paketler yüklenir)
- **Güncellemeli başlatma**: ~30-60 saniye (sadece güncel olmayanlar)
- **Normal başlatma**: ~5-10 saniye (güncelleme yok)

## 🛡️ Güvenlik

- Sadece package.json'da tanımlı paketler güncellenir
- Versiyon aralıkları korunur (^ ve ~ sembolleri)
- Major versiyon değişiklikleri otomatik yapılmaz
- npm resmi registry'den güvenli indirme

## 💡 İpuçları

1. **İnternet Bağlantısı**: Güncelleme için internet gerekir
2. **Disk Alanı**: ~500MB boş alan önerilir
3. **Güncelleme Sıklığı**: Haftada bir otomatik güncelleme yeterli
4. **Hata Durumunda**: Internet bağlantınızı kontrol edin

## 🔧 Sorun Giderme

### "npm update" başarısız olursa:
```bash
# Cache'i temizle
npm cache clean --force

# Tekrar dene
npm install
npm update
```

### Paketler yüklenmiyor:
```bash
# node_modules'ü sil ve yeniden yükle
rmdir /s /q node_modules
npm install
```

### Windows'ta encoding problemi:
```bash
# UTF-8 encoding aktif et
chcp 65001
START_SERVER.bat
```

## 📋 Changelog

### v3.0 - Otomatik Güncelleme Sistemi
- ✅ START_SERVER.bat otomatik güncelleme eklendi
- ✅ start_server.sh Linux/Mac desteği
- ✅ FIRST_TIME_SETUP.bat ilk kurulum scripti
- ✅ npm run auto-start komutu eklendi
- ✅ Profesyonel arayüz ve hata yönetimi
