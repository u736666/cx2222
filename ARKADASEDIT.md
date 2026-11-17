# 🚀 cx2222 — Hızlı Kurulum & İçerik Düzenleme Rehberi

Bu rehber, **cx2222** projesini kendi bilgisayarında çalıştırıp **Yerel Mini-CMS Yönetim Paneli** üzerinden tüm site içeriklerini, görsellerini, renklerini ve tipografisini kod yazmadan kolayca düzenleyebilmen için hazırlanmıştır.

---

## 1. Bilgisayarında Bulunması Gerekenler (Ön Hazırlık)

Projeyi çalıştırmak için bilgisayarında sadece **Node.js** kurulu olması yeterlidir:

1. **Node.js Kontrolü:**
   Terminali (Mac/Linux için `Terminal`, Windows için `PowerShell` veya `Git Bash`) aç ve şu komutu yaz:
   ```bash
   node -v
   ```
   *Eğer ekranda `v18.x`, `v20.x` veya `v22.x` görüyorsan hazırsın.*  
   *Eğer kurulu değilse veya hata alıyorsan [nodejs.org](https://nodejs.org/) adresinden **LTS (Uzun Süreli Destek)** sürümünü indirip kurabilirsin.*

---

## 2. İlk Kurulum (Sadece 1 Kere Yapılır)

Proje klasörünü bilgisayarına indirdikten/açtıktan sonra terminalden klasörün içine git:

```bash
cd cx2222
```

Gerekli paketleri yüklemek için:

```bash
npm install
```

*(Yükleme internet hızına bağlı olarak 15-30 saniye sürer ve bir kere yapılması yeterlidir).*

---

## 3. Projeyi ve Yönetim Panelini Başlatma

Terminalde proje klasöründeyken şu komutu çalıştır:

```bash
npm run dev
```

Komut çalıştıktan sonra terminalde şu satırı göreceksin:
```text
▶ http://localhost:4321/
```

Artık tarayıcını açıp şu adreslere girebilirsin:

| Ne Açmak İstiyorsun? | Tarayıcı Adresi | Açıklama |
| :--- | :--- | :--- |
| **🌐 Web Sitesi** | [http://localhost:4321](http://localhost:4321) | Sitenin canlı ziyaretçi görünümü |
| **🛠️ Yönetim Paneli (CMS)** | [http://localhost:4321/admin](http://localhost:4321/admin) | Tüm içerikleri ve ayarları düzenleyeceğin panel |

> **Önemli İpucu:** Düzenleme yaparken terminal penceresini kapatma. Sunucu çalıştığı sürece panel aktif kalır. Kapatmak istediğinde terminalde `Ctrl + C` tuşlarına basabilirsin.

---

## 4. Yönetim Paneli Nasıl Kullanılır? (Modül Modül Rehber)

`http://localhost:4321/admin` adresine girdiğinde sol menüde sitenin tüm bölümlerini göreceksin:

```
[🎨 Tema & Renkler]
[🖼️ Medya & Görseller]
[🏠 Ana Sayfa]
[💼 Projeler]
[📝 Blog]
[📄 Sabit Sayfalar]
[🌐 Site Geneli]
```

### 1) 🎨 Tema & Renkler
- Sitedeki tüm ana renkleri (`Vurgu Rengi / Accent`, `Zemin Rengi`, `Koyu Alanlar`, `Metin Renkleri`) renk seçiciyle tek tıkla değiştirebilirsin.
- H1, H2, H3, H4 başlık boyutlarını ve gövde yazı büyüklüklerini ayarlayabilirsin.

### 2) 🖼️ Görsel Kütüphanesi & Görsel Seçimi
Sitedeki herhangi bir alana görsel eklerken:
- **`🖼️ Önizlemeli Seç (71)` Butonu:** Bu butona basarak açılan görsel galerisinden sitede kullanılan tüm fotoğrafları küçük resimleri (thumbnail), kategorileri ve isimleriyle görerek tek tıkla seçebilirsin.
- **`Bilgisayardan Yükle` Butonu:** Kendi bilgisayarından yeni bir görsel seçtiğinde otomatik olarak projeye yüklenir ve alana atanır.
- **Canlı Önizleme:** Seçtiğin veya değiştirdiğin her görselin küçük önizlemesi alanın sol tarafında anında görünür.

### 3) 🏠 Ana Sayfa Yönetimi
Ana sayfa sekmesi kendi içinde alt başlıklara ayrılmıştır:
- **Hero Slider:** Giriş ekranındaki kayan büyük slaytların başlıklarını, açıklamalarını, buton yazılarını ve arka plan fotoğraflarını düzenleyebilirsin.
- **Manifesto Bölümü (Cümle İçi SVG İkonlar & Vurgular):**
  - **Ana Cümle Alanı:** Cümleyi tek parça halinde özgürce düzenleyebilirsin.
  - **İkonların Konumunu Değiştirme:** Metin içindeki `[icon-1]`, `[icon-2]`, `[icon-3]` etiketlerini cümlenin dilediğin yerine kesip yapıştırarak sırasını değiştirebilirsin.
  - **İkon Çıkarma:** Cümleden bir ikonu kaldırmak için etiketini metinden silmen yeterlidir.
  - **Yeni İkon Ekleme:** `+ Yeni İkon Ekle` butonuna basarak istediğin kadar yeni ikon (`[icon-4]`, `[icon-5]`) oluşturabilir, hazır şablonlardan (Çip, Beyin, Sparkle, Şimşek, Gülen Yüz, Kalp vb.) seçebilir veya özel SVG kodu yapıştırabilirsin.
  - **Altı Çizili Vurgu:** Metinde vurgulamak istediğin kelimeleri `<u>vurgulu kelime</u>` içine alabilirsin.
  - **Canlı Önizleme Kutusu:** Metin alanının hemen altındaki canlı kutudan cümlenin ikonlarıyla birlikte sayfada nasıl duracağını anlık olarak görebilirsin.
- **Referans Logoları:** Ana sayfada akan marka logolarını sıralayabilir, yenilerini ekleyebilir veya silebilirsin.
- **Neden Şimdi?, Çözümler, Öne Çıkanlar:** İlgili alt sekmelerden tüm metinleri ve istatistikleri güncelleyebilirsin.

### 4) 💼 Projeler & Vaka Analizleri
- Sol üstteki **"+ Yeni Proje Ekle"** butonuyla portfolyoya yeni bir çalışma ekleyebilirsin.
- Müşteri adı, proje başlığı, kategori, özet, proje künyesi (Yıl, Kapsam vb.), metrikler (Örn: `%40 NPS Artışı`) ve detay ekran görüntülerini girebilirsin.

### 5) 📝 Blog Yazıları
- **"+ Yeni Yazı Ekle"** butonuyla yeni makale oluşturabilirsin.
- Başlık, özet, yazar, okuma süresi, kapak görseli ve içerik bloklarını (paragraflar, ara başlıklar, alıntılar) ekleyebilirsin.

### 6) 📄 Sabit Sayfalar
- **Yaklaşımımız, Neden Şimdi, Çözümler, cx2222 Akademi, İletişim, 404** gibi tüm alt sayfaların başlık, açıklama ve içerik kartlarını bu sekmeden düzenleyebilirsin.

### 7) 🌐 Site Geneli, Menü & Footer
- Üst menü bağlantılarını, açılır mega menüleri, footer linklerini, telif hakkı metnini, sosyal medya hesaplarını ve iletişim formu ayarlarını buradan yönetebilirsin.

---

## 5. Değişiklikleri Kaydetme & Canlıya Alma

Panelde bir şey değiştirdiğinde sağ üst köşede **"Kayıt Bekliyor (Değişiklik Var)"** sarı uyarı rozeti çıkar.

1. Sağ üstteki **"Değişiklikleri Kaydet"** butonuna bas.
2. Sistem:
   - İlgili JSON dosyasını diske yazar.
   - Arka planda **otomatik olarak statik derlemeyi (`npm run build`)** çalıştırır (yaklaşık 1 saniye sürer).
   - "Değişiklikler Kaydedildi ve Derlendi ✓" uyarısı verir.
3. [http://localhost:4321](http://localhost:4321) adresini tarayıcında yenilediğin anda değişikliklerin anında yayında olduğunu görürsün!

---

## 6. Projeyi Canlıya (Vercel) Yayınlama & Güncelleme

Site **Vercel** üzerinde yayındadır:
- **🌐 Canlı Site Adresi:** [https://example.com](https://example.com)
- **🐙 GitHub Deposu:** [https://github.com/u736666/cx2222](https://github.com/u736666/cx2222)

İçerik düzenlemelerini yaptıktan sonra siteyi canlıya almak için 2 çok kolay yöntem vardır:

### Yöntem 1: Panel Üzerinden Tek Tıkla Yayınlama (Önerilen)
1. Yönetim panelinin sağ üst köşesindeki siyah **"▲ Vercel'e Yayınla ↗"** butonuna bas.
2. Açılan pencerede istersen kısa bir değişiklik notu yaz (örn: *"Yeni referans logoları eklendi"*).
3. **"Derle, GitHub'a Gönder ve Vercel'de Yayınla 🚀"** butonuna tıkla.
4. Sistem önce yerel derlemeyi test eder, ardından dosyaları GitHub deposuna yükler.
5. Vercel değişikliği anında algılayıp 1-2 dakika içinde [https://example.com](https://example.com) adresini otomatik olarak günceller!

> **İpucu:** Eğer GitHub şifresi veya token sorarsa, açılır ayarlar menüsünden kişisel GitHub token'ını bir kere yapıştırıp kaydedebilirsin.

### Yöntem 2: Terminalden 3 Basit Komutla Yayınlama
Terminalde proje klasöründeyken şu 3 komutu çalıştırman yeterlidir:
```bash
git add .
git commit -m "Site içerikleri ve görseller güncellendi"
git push origin main
```
Komut biter bitmez Vercel otomatik olarak yayını hazırlar ve canlıya alır.

---

## 7. Sık Karşılaşılan Sorunlar & Pratik Çözümler

- **Soru: `Port 4321 is in use` hatası alıyorum, ne yapmalıyım?**  
  *Çözüm:* Terminalde zaten açık kalmış bir oturum olabilir. Terminali kapatıp yeniden açabilir veya Mac/Linux'ta `kill -9 $(lsof -ti :4321)` çalıştırıp ardından tekrar `npm run dev` diyebilirsin.

- **Soru: Yeni yüklediğim görsel sitede görünmüyor?**  
  *Çözüm:* Panelde görsel yükledikten sonra sağ üstteki **"Değişiklikleri Kaydet"** butonuna bastığından emin ol. Görsel dosya yolunun `/images/uploads/...` veya `https://...` şeklinde başladığını kontrol et.

- **Soru: Yanlış bir şey yaptım, orijinal metne nasıl dönerim?**  
  *Çözüm:* SVG ikonlarında ve metin alanlarında bulunan **"Varsayılana Sıfırla"** butonlarına basarak orijinal içeriklere her an geri dönebilirsin.

---

🎉 **Tebrikler!** Artık sitenin tüm içeriklerini, renklerini ve görsellerini hiçbir kodlama bilgisine ihtiyaç duymadan özgürce yönetebilirsin.
