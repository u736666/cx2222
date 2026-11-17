# cx2222 Statik Hosting & Sunucu Dağıtım Kılavuzu

Bu doküman, cx2222 projesinin GitHub/Vercel test ortamından çıkarılıp nihai statik barındırma sunucusuna (cPanel, DirectAdmin, Apache, Nginx, Plesk vb.) taşınması için gereken tüm yönergeleri içerir.

---

## 1. Mimarisi ve Çıktı Yapısı
- **Framework**: Astro 7 + Tailwind 3
- **Çıktı Modu**: Tam Statik (`output: 'static'`)
- **Derleme Klasörü**: `dist/`
- Derleme komutu (`npm run build`) çalıştığında tüm site saf HTML, CSS, JavaScript ve optimize edilmiş görsellerden oluşan bağımsız bir statik paket haline gelir. Sunucuda Node.js çalıştırma zorunluluğu yoktur.

---

## 2. Sunucu Yapılandırmaları

### A) Apache / cPanel / DirectAdmin / Litespeed
Apache tabanlı paylaşımlı hosting veya sunucularda, `dist/` klasörünün kök dizinine (public_html) `docs/.htaccess` dosyasını `.htaccess` olarak kopyalayınız.

**Örnek `.htaccess` Güvenlik & Önbellek Kuralları:**
```apache
# Güvenlik Başlıkları
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Uzun Vadeli Önbellekleme (Immutable Assets)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Özel 404 Sayfası
ErrorDocument 404 /404.html
```

### B) Nginx Sunucu Yapılandırması
Nginx sunucusunda `docs/nginx.conf` şablonunu kullanabilirsiniz:
```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/cx2222/dist;
    index index.html;

    # Güvenlik Başlıkları
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Statik Varlıklar Önbelleği
    location ~* \.(?:css|js|woff2?|svg|webp|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML Sayfaları İçin Önbellek
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Rota ve 404 Yönlendirmesi
    location / {
        try_files $uri $uri/ $uri.html /404.html;
    }

    error_page 404 /404.html;
}
```

---

## 3. İletişim Formu Entegrasyonu (Statik Host İçin)
Statik sitede dinamik backend kodu (veritabanı, PHP vb.) bulunmadığından iletişim formları için 2 seçenek mevcuttur:

1. **Harici Form Servisi (Önerilen)**:
   - [Formspree](https://formspree.io) veya [Web3Forms](https://web3forms.com) gibi bir servisten form endpoint URL'si alın.
   - CMS yönetim panelinde **Site Ayarları → İletişim Formu** sekmesinden `Form Action URL` alanına girin (Örn: `https://formspree.io/f/mqkenvpo`).
2. **Kendi PHP Scriptiniz**:
   - Sunucunuzda e-posta gönderen basit bir `send-mail.php` dosyası barındırın ve CMS'te Form Action olarak `/send-mail.php` belirtin.

---

## 4. Yayına Çıkış (Go-Live) Kontrol Listesi

- [ ] **1. Gerçek Domain Tanımlama**:
  `src/data/site.json` dosyasında veya CMS panelinde **Site Ayarları → Marka** sekmesinde `siteUrl` değerini geçici `https://example.com` yerine gerçek alan adınızla değiştirin (Örn: `https://cx2222.com`).
- [ ] **2. Arama Motorlarına Açma (noindex kapatma)**:
  `src/data/site.json` dosyasında `brand.noindex: false` yapın. Böylece `robots.txt` dosyası `Disallow: /` modundan çıkıp sitemap indeksine bağlanacak ve tüm sayfalardan meta `noindex` kalkacaktır.
- [ ] **3. İletişim Form Action Belirleme**:
  CMS Site Ayarları'ndan canlı form endpoint'ini tanımlayın.
- [ ] **4. Son Karşılaştırma & Derleme**:
  `npm run build` ve `node scripts/compare.mjs` çalıştırarak hatasız derlemeyi teyit edin.
- [ ] **5. Sunucuya Yükleme**:
  Panelden **Yayın & Yedekler → Yayın Paketi Hazırla (.zip)** butonuna tıklayarak oluşturulan `dist.zip` dosyasını indirin ve sunucunuzun kök dizinine açın.
