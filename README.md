# 🤖 Akıllı Metin Asistanı

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=google-chrome)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![AI](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=openai)
![Security](https://img.shields.io/badge/Security-Enterprise-red?style=for-the-badge&logo=shield)

**Seçili metinleri yapay zeka ile iyileştiren ve prompt'lara dönüştüren güvenli tarayıcı eklentisi**

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?style=for-the-badge&logo=google-chrome)](https://chrome.google.com/webstore)
[![GitHub](https://img.shields.io/badge/GitHub-⭐_Star-181717?style=for-the-badge&logo=github)](https://github.com/irfankarabacak/Akilli-Metin-Asistan-Extension)

</div>

---

## ✨ Özellikler

### 🚀 **6 Farklı AI Servisi**
- **🆓 Pollinations AI** - Ücretsiz, hızlı
- **⚡ Groq** - Llama 3.3 70B, çok hızlı
- **🌟 Google Gemini** - Google'ın güçlü AI'ı
- **🤖 OpenAI** - GPT-3.5/4 desteği
- **🧠 Claude** - Anthropic'in AI'ı
- **🔧 Özel API** - Kendi endpoint'iniz

### 🎯 **Akıllı Metin İşleme**
- **📝 Metin İyileştirme** - Yazım, dil bilgisi, akış
- **💡 Prompt Oluşturma** - AI için optimize edilmiş prompt'lar
- **📊 Özetleme** - Uzun metinleri özetleme
- **🌍 Çoklu Dil** - Türkçe, İngilizce ve daha fazlası

### 🔒 **Enterprise Güvenlik**
- **🔐 Şifreli Saklama** - API anahtarları güvenle saklanır
- **🛡️ Zero-Log** - Hiçbir hassas bilgi loglanmaz
- **🔒 HTTPS Zorunlu** - Tüm bağlantılar güvenli
- **🎯 Minimal İzinler** - Sadece gerekli izinler

### 🎨 **Modern Arayüz**
- **🌙 Karanlık/Aydınlık Tema** - Göz dostu tasarım
- **📱 Responsive** - Mobil ve masaüstü uyumlu
- **⚡ Hızlı** - Anında işlem
- **🎯 Sezgisel** - Kolay kullanım

---

## 🚀 Kurulum

### 📦 **Chrome Web Store'dan (Önerilen)**
1. [Chrome Web Store](https://chrome.google.com/webstore) linkine tıklayın
2. "Ekle" butonuna tıklayın
3. Tarayıcınızı yenileyin

### 🔧 **Manuel Kurulum**
```bash
# Projeyi klonlayın
git clone https://github.com/irfankarabacak/Akilli-Metin-Asistan-Extension.git

# Chrome'da Extensions sayfasına gidin
# chrome://extensions/

# "Developer mode" aktif edin
# "Load unpacked" ile klasörü seçin
```

---

## 🎯 Kullanım

### 1️⃣ **Metin Seçin**
- Web sayfasında istediğiniz metni seçin
- ✨ butonu otomatik görünür

### 2️⃣ **İşlem Seçin**
- **📝 İyileştir** - Yazım ve dil bilgisi
- **💡 Prompt'a Çevir** - AI için optimize et
- **📊 Özetle** - Kısa özet oluştur

### 3️⃣ **AI Seçin**
- **🆓 Ücretsiz:** Pollinations AI
- **🔑 API Anahtarı:** Daha güçlü AI'lar

---

## 🔑 API Anahtarları

### 🆓 **Ücretsiz Seçenekler**
- **[Groq](https://console.groq.com/keys)** - Ücretsiz, çok hızlı ⚡
- **[Gemini](https://makersuite.google.com/app/apikey)** - Google'ın AI'ı ✨

### 💰 **Ücretli Seçenekler**
- **[OpenAI](https://platform.openai.com/api-keys)** - GPT-3.5/4 🤖
- **[Claude](https://console.anthropic.com/)** - Anthropic AI 🧠
- **[Cohere](https://dashboard.cohere.ai/)** - Cohere AI 🔥

### 🔧 **Özel API**
- Kendi endpoint'inizi kullanın
- Custom model desteği
- Esnek konfigürasyon

---

## 🛡️ Güvenlik

### 🔐 **Veri Koruma**
- API anahtarları XOR şifreleme ile korunur
- Hiçbir hassas bilgi loglanmaz
- Tüm veriler yerel olarak saklanır

### 🌐 **Network Güvenliği**
- Tüm API çağrıları HTTPS
- Spesifik endpoint izinleri
- Güvenli Content Security Policy

### 🔒 **İzinler**
- `activeTab` - Sadece aktif sekme
- `storage` - Ayarları saklamak için
- Minimal ve gerekli izinler

---

## 🎨 Özelleştirme

### 🌙 **Tema Seçenekleri**
- **☀️ Aydınlık Tema** - Gün ışığında kullanım
- **🌙 Karanlık Tema** - Gece kullanımı
- **🔄 Otomatik Geçiş** - Sistem temasına uyum

### 📝 **Prompt Şablonları**
- **6 Farklı Şablon** - Her ihtiyaca uygun
- **Özelleştirilebilir** - Kendi prompt'larınızı ekleyin
- **Geçmiş** - Önceki işlemleri görün

### ⚙️ **Ayarlar**
- **Dil Seçimi** - Çıktı dili
- **Sayfa Başlığı** - Context için
- **Varsayılan AI** - Otomatik seçim

---

## 🔧 Geliştirici Bilgileri

### 📁 **Proje Yapısı**
```
├── manifest.json          # Extension manifest
├── background/            # Service worker
│   └── background.js      # Ana işlem mantığı
├── content/              # Content scripts
│   ├── content.js        # UI ve etkileşim
│   └── content.css       # Stil dosyası
├── popup/                # Popup arayüzü
│   ├── popup.html        # HTML yapısı
│   ├── popup.js          # JavaScript mantığı
│   └── popup.css         # Stil dosyası
└── icons/                # Extension ikonları
```

### 🛠️ **Teknolojiler**
- **Manifest V3** - En güncel Chrome Extension standardı
- **ES6+ JavaScript** - Modern JavaScript özellikleri
- **CSS3** - Responsive ve animasyonlu tasarım
- **Chrome APIs** - Storage, Runtime, Tabs

### 🔧 **Geliştirme**
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run dev

# Production build
npm run build
```

---

## 📊 Performans

### ⚡ **Hız**
- **Anında İşlem** - 1-3 saniye
- **Lazy Loading** - Gerektiğinde yükleme
- **Optimize Kod** - Minimal kaynak kullanımı

### 💾 **Bellek**
- **Hafif** - < 5MB RAM kullanımı
- **Efficient** - Garbage collection
- **Clean** - Otomatik temizlik

### 🌐 **Network**
- **HTTPS Zorunlu** - Güvenli bağlantılar
- **Retry Logic** - Hata durumunda tekrar deneme
- **Timeout** - Uzun süren istekleri iptal

---

## 🤝 Katkıda Bulunma

### 🐛 **Hata Bildirimi**
1. [Issues](https://github.com/irfankarabacak/Akilli-Metin-Asistan-Extension/issues) sayfasına gidin
2. "New Issue" butonuna tıklayın
3. Hata detaylarını açıklayın

### 💡 **Özellik İsteği**
1. [Discussions](https://github.com/irfankarabacak/Akilli-Metin-Asistan-Extension/discussions) bölümüne gidin
2. Yeni özellik önerinizi paylaşın
3. Topluluk geri bildirimlerini bekleyin

### 🔧 **Kod Katkısı**
1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull Request gönderin

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

<div align="center">

**İrfan Karabacak**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)](https://github.com/irfankarabacak)
[![Repository](https://img.shields.io/badge/Repository-View-4285F4?style=for-the-badge&logo=github)](https://github.com/irfankarabacak/Akilli-Metin-Asistan-Extension)

</div>

---

## 🌟 Yıldız Verin

Bu projeyi beğendiyseniz ⭐ yıldız vermeyi unutmayın!

[![GitHub stars](https://img.shields.io/github/stars/irfankarabacak/Akilli-Metin-Asistan-Extension?style=social)](https://github.com/irfankarabacak/Akilli-Metin-Asistan-Extension)

---

<div align="center">

**🚀 Chrome Web Store'da yakında!**

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?style=for-the-badge&logo=google-chrome)](https://chrome.google.com/webstore)

</div>