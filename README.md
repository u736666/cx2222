# cx2222 — Yapay Zeka Çağında İnsan Odaklı Müşteri Deneyimi

**cx2222** kurumsal web platformu; **Astro**, **Tailwind CSS** ve **JSON tabanlı yerel Mini-CMS** ile geliştirilmiş, **Vercel** üzerinde barındırılan tam statik (`output: 'static'`) modern bir web projesidir.

Tasarım dili keskin köşeli (`border-radius: 0`), gölgesiz, yüksek kontrastlı mimari ızgara ve **Sora** tipografisi (`cx2222 tasarım referansı` tasarım referansı) üzerine kuruludur. İçeriklerin, renklerin, tipografi ölçeğinin, sayfa bazlı SEO/GEO verilerinin, menü/footer/form ayarlarının ve görsellerin tamamı yerel JSON dosyalarından yönetilir ve derleme zamanında saf HTML/CSS/TXT çıktılarına dönüştürülür.

- **🌐 Canlı Yayın Adresi:** [https://example.com](https://example.com)
- **🐙 GitHub Deposu:** [https://github.com/u736666/cx2222](https://github.com/u736666/cx2222)
- **🛠️ Yönetim Paneli:** `http://localhost:4321/admin` *(yalnızca yerel ortamda aktiftir)*

---

## İçindekiler

- [Teknoloji Yığını ve Öne Çıkan Özellikler](#teknoloji-yığını-ve-öne-çıkan-özellikler)
- [Proje Yapısı](#proje-yapısı)
- [Sayfalar ve Rotalar](#sayfalar-ve-rotalar)
- [Gereksinimler ve Yerel Kurulum](#gereksinimler-ve-yerel-kurulum)
- [Yerel Mini-CMS Kullanımı (`/admin`)](#yerel-mini-cms-kullanımı-admin)
- [Tema, Renk ve Tipografi Yönetimi](#tema-renk-ve-tipografi-yönetimi)
- [GEO / AEO / SEO ve Erişilebilirlik Mimarisi](#geo--aeo--seo-ve-erişilebilirlik-mimarisi)
- [İçerik Güncelleme ve Vercel Yayın İş Akışı](#içerik-güncelleme-ve-vercel-yayın-iş-akışı)
- [Vercel Dağıtım ve Yapılandırma Notları](#vercel-dağıtım-ve-yapılandırma-notları)
- [Canlı Ortam Öncesi Kontrol Listesi ve Notlar](#canlı-ortam-öncesi-kontrol-listesi-ve-notlar)

---

## Teknoloji Yığını ve Öne Çıkan Özellikler

| Bileşen | Paket / Teknoloji | Açıklama |
| --- | --- | --- |
| Çatı (Framework) | `astro` (`^7.4.10`) | Tam statik çıktı üretimi (`output: 'static'`) |
| Stil Sistemi | `tailwindcss` (`^3.4.19`) + `@astrojs/tailwind` (`^6.0.2`) | CSS değişkenlerine bağlı yardımcı sınıflar |
| Site Haritası | `@astrojs/sitemap` (`^3.7.4`) | Otomatik `sitemap-index.xml` üretimi (`/404` hariç) |
| İçerik Katmanı | JSON (`src/data/`) + `src/lib/content.ts` | Tek noktadan tipli JSON veri okuyucu (`SeoGeoConfig`, `ThemeTypography`) |
| AI / GEO Beslemesi | `src/pages/llms.txt.ts` | JSON içeriklerinden derleme zamanında dinamik `/llms.txt` üretimi |
| Yerel Yönetim | `cms/dev-plugin.mjs` + `cms/admin.html` | Sadece `astro dev` sırasında çalışan **7 sekmeli** yerel Mini-CMS |
| Hedef Hosting | **Vercel** (`https://example.com`) | GitHub Git Entegrasyonu ile otomatik CI/CD dağıtımı |

---

## Proje Yapısı

```text
cx2222/
├── astro.config.mjs              # Astro static yapılandırması, sitemap ve yerel CMS Vite eklentisi
├── tailwind.config.mjs           # CSS değişkenlerine bağlanan renkler ve Sora yazı tipi
├── package.json                  # Betikler (dev, build, preview) ve bağımlılıklar
├── ARKADASEDIT.md                # Arkadaş / içerik ekibi için adım adım resimli CMS kullanım kılavuzu
├── cms/
│   ├── dev-plugin.mjs            # Yalnızca npm run dev'de çalışan /admin ve /api/cms/* Vite middleware'i
│   ├── deploy-runner.mjs         # Git kontrolü, build doğrulama ve Vercel/GitHub deploy çalıştırıcısı
│   ├── deploy.config.json        # Hedef Vercel projesi (cx2222) ve GitHub depo yapılandırması
│   └── admin.html                # 7 sekmeli yerel Mini-CMS tek sayfa yönetim arayüzü
├── public/
│   ├── _headers                  # Güvenlik ve Cache-Control başlıkları
│   ├── robots.txt                # Arama motoru tarama ve sitemap adresi
│   └── images/
│       ├── logos/                # 50+ müşteri referans marka SVG/WebP logoları
│       └── uploads/              # Mini-CMS üzerinden yüklenen vaka, blog ve içerik görselleri
└── src/
    ├── data/
    │   ├── theme.json            # Merkezi renk tokenları (--color-*) ve tipografi ölçeği (H1–H4, Body, Button)
    │   ├── site.json             # Marka, özel logo, header, mega menüler, footer, CTA, iletişim formu
    │   ├── home.json             # Hero slaytları, manifesto, logolar, "Neden Şimdi?", çözümler, slider, SEO/GEO
    │   ├── pages.json            # 11 sabit alt sayfa içeriği, SEO/GEO verileri ve cx2222 Maturity Testi soruları
    │   ├── projects/*.json       # 8 adet proje vaka analizi (koleksiyon + sayfa bazlı SEO/GEO)
    │   └── blog/*.json           # 3 adet blog makalesi (koleksiyon + sayfa bazlı SEO/GEO)
    ├── layouts/
    │   └── Layout.astro          # <html lang="tr">, SEO/GEO meta, OG, theme.json CSS enjeksiyonu, JSON-LD
    ├── lib/
    │   └── content.ts            # JSON veri okuyucuları ve yüzey/şerit stil eşlemeleri
    ├── styles/
    │   └── global.css            # Sora fontu, :root tipografi varsayılanları, keskin köşe, Türkçe heceleme
    ├── components/               # Header, HeroSlider, FAQSection, ContactSection, CTASection, Footer
    └── pages/                    # Astro statik/dinamik [slug] rotaları ve llms.txt.ts
```

---

## Sayfalar ve Rotalar

`npm run build` çalıştırıldığında toplam **24 statik HTML sayfası**, dinamik olarak derlenen **1 `/llms.txt` çıktısı** ve **site haritası** (`dist/sitemap-index.xml`, `dist/sitemap-0.xml`) üretilir:

| Rota | Kaynak Dosya | İçerik Kaynağı |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | `home.json`, `projects/*.json`, `blog/*.json` |
| `/yaklasimimiz/` | `src/pages/yaklasimimiz.astro` | `pages.json` (`yaklasimimiz`) |
| `/neden-simdi/` | `src/pages/neden-simdi.astro` | `pages.json` (`nedenSimdi`) |
| `/cozumler/` | `src/pages/cozumler/index.astro` | `pages.json` (`cozumlerIndex`) |
| `/cozumler/ai-destekli-cx/` | `src/pages/cozumler/ai-destekli-cx.astro` | `pages.json` (`aiDestekliCx`) |
| `/cozumler/deneyim-tasarimi/` | `src/pages/cozumler/deneyim-tasarimi.astro` | `pages.json` (`deneyimTasarimi`) |
| `/cozumler/cx2222-akademi/` | `src/pages/cozumler/cx2222-akademi.astro` | `pages.json` (`cx2222 Akademi`) |
| `/cozumler/cx-maturity-testi/` | `src/pages/cozumler/cx-maturity-testi.astro` | `pages.json` (`cx2222 Maturity Testi`) |
| `/projeler/` | `src/pages/projeler/index.astro` | `pages.json` (`projelerIndex`) + `projects/*.json` |
| `/projeler/[slug]/` | `src/pages/projeler/[slug].astro` | `src/data/projects/*.json` (8 vaka analizi) |
| `/blog/` | `src/pages/blog/index.astro` | `pages.json` (`blogIndex`) + `blog/*.json` |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` | `src/data/blog/*.json` (3 makale) |
| `/iletisim/` | `src/pages/iletisim.astro` | `pages.json` (`iletisim`) + `site.json` |
| `/llms.txt` | `src/pages/llms.txt.ts` | `site.json`, `home.json`, `pages.json`, `projects/*.json`, `blog/*.json` |
| `/404.html` | `src/pages/404.astro` | `pages.json` (`notFound`) |

---

## Gereksinimler ve Yerel Kurulum

### Gereksinimler

- **Node.js:** `20.x` veya `22.x` LTS (veya üzeri)
- **npm:** Node.js ile birlikte gelen güncel sürüm

### Kurulum ve Çalıştırma

```bash
# 1. Proje dizinine girin
cd cx2222

# 2. Bağımlılıkları yükleyin
npm install

# 3. Yerel geliştirme sunucusunu (ve yerel Mini-CMS'i) başlatın
npm run dev
```

Geliştirme sunucusu açıldığında:

- **Web Sitesi:** `http://localhost:4321`
- **Yerel Mini-CMS Paneli:** `http://localhost:4321/admin`

### Derleme ve Yerel Önizleme

```bash
# Statik üretim çıktısını ./dist klasörüne derler
npm run build

# ./dist klasöründeki derlenmiş statik siteyi yerel olarak test eder
npm run preview
```

> **Not:** `npm run preview` statik derleme çıktısını sunduğu için `/admin` panelini içermez; CMS paneli yalnızca `npm run dev` sırasında aktiftir.

---

## Yerel Mini-CMS Kullanımı (`/admin`)

Proje içinde harici veritabanı veya üçüncü parti CMS bağımlılığı gerektirmeyen özel bir yerel yönetim paneli (`cms/admin.html`) bulunur.

1. Terminalde `npm run dev` komutunu çalıştırın.
2. Tarayıcıdan `http://localhost:4321/admin` adresine gidin.
3. Sol menüdeki **7 yönetim sekmesinden** düzenlemek istediğiniz alanı seçin:
   - **Renkler & Tipografi:** 13 site renk tokenını canlı önizleme ile düzenleme, **"Varsayılan cx2222 Paletine Sıfırla"**; ayrıca `H1`–`H4` (mobil/masaüstü px boyutu, weight, line-height), `Lead`, `Body`, `Küçük / Meta Yazı`, `Buton Yazısı` ve `Başlık Harf Aralığı` (`em`) değerlerini ayarlama ve **"Tipografiyi Varsayılana Sıfırla"**.
   - **Medya & Görseller:** Tüm JSON içeriklerindeki görsel kullanım noktaları ile `public/images/uploads/` ve `public/images/logos/` dosyalarını (70+ dosya) tek merkezden görme; `Tümü`, `Kullanımda`, `Kullanılmayan Yerel`, `Harici URL`, `Logolar` ve `Yüklenenler` filtreleriyle arama, önizlemeli galeri seçimi, hedef klasör seçerek dosya yükleme ve kullanılmayan yerel görselleri diskten silme.
   - **Ana Sayfa:** Hero slaytları, manifesto cümlesi içi SVG ikon yerleşimi (`[icon-1]`, `[icon-2]`, vb.), dinamik SVG ikon ekleme/çıkarma/sıralama, referans marka logoları, *Neden Şimdi?* akordeon kartları, çözümler vitrini, problem seçici slider, bölüm H-etiketleri ve ana sayfa **SEO & GEO** ayarları.
   - **Projeler:** `src/data/projects/*.json` altındaki vaka analizlerini ekleme, düzenleme, sıralama, silme ve her proje için **SEO & GEO** alanları (`Article`).
   - **Blog Yazıları:** `src/data/blog/*.json` altındaki makaleleri, içerik bloklarını (`heading`, `paragraph`, `calloutList`, `gridCards`) yönetme ve her makale için **SEO & GEO** alanları (`BlogPosting`).
   - **Sayfalar, Test & SEO:** 11 sabit alt sayfa (`Yaklaşımımız`, `Neden Şimdi?`, `Çözümler Ana`, `AI Destekli CX`, `Deneyim Tasarımı`, `cx2222 Akademi`, `Maturity Testi`, `Projeler Ana`, `Blog Ana`, `İletişim`, `404 Sayfası`), H-etiketi seçimleri, **CX & AI Maturity Testi** soruları/seviyeleri ve sayfa bazlı **SEO & GEO** editörü.
   - **Menü, Footer & İletişim:** 4 alt sekme altında (*Marka, Logo & Ofisler*, *Menü (Header) & Footer*, *Mega Menüler*, *İletişim Formu & Ortak CTA*) özel header görsel logosu (`logoImage`), ofis/sosyal bağlantılar, üst menü linkleri ve mega menü eşlemeleri, footer görünürlüğü/telif metinleri, ortak CTA banner ve iletişim formunun tüm kontrolleri.
4. Sağ üstteki **Değişiklikleri Kaydet** butonuna basın; ilgili JSON dosyası doğrudan diske yazılır ve açık site sekmelerinde anında görünür.
5. Düzenlemeleri canlıya almak istediğinizde yine sağ üstteki **▲ Vercel'e Yayınla ↗** butonuna tıklayarak doğrudan panel içinden GitHub'a commit ve push yapabilirsiniz.

### Görsel Yükleme ve Önizlemeli Seçim

- Sitedeki herhangi bir görsel alanında **"🖼️ Önizlemeli Seç (71)"** butonuna basarak tüm kütüphaneyi küçük resimler, isimler ve klasör gruplarıyla listeleyen görsel galerisinden tek tıkla seçim yapabilirsiniz.
- Bilgisayarınızdan yeni yüklenen görseller seçilen klasöre göre (`uploads` veya `logos`) otomatik temizlenmiş ad ve benzersiz kimlikle diske yazılır.

---

## Tema, Renk ve Tipografi Yönetimi

Tüm marka/yüzey renkleri ve tipografi ayarları [`src/data/theme.json`](src/data/theme.json) dosyasında tutulur:

1. [`src/layouts/Layout.astro`](src/layouts/Layout.astro) `theme.json` dosyasını okur ve tüm sayfaların `<head>` etiketine `--color-*` değişkenlerini, `px` değerlerinden türetilen `rem` / akışkan `clamp()` tipografi değişkenlerini (`--fs-body`, `--lh-body`, `--fs-lead`, `--fs-h1`–`--fs-h4`, `--fw-h1`–`--fw-h4`, `--lh-h1`–`--lh-h4`, `--fs-small`, `--fs-btn`, `--ls-heading`) ve dinamik SVG favicon renklerini basar.
2. [`tailwind.config.mjs`](tailwind.config.mjs) renk değişkenlerini `bg-brandAccent`, `text-paletteRichBlack`, `bg-palettePlatinum`, `bg-paletteDustGrey`, `bg-paletteSandyBrown` gibi sınıflara bağlar.
3. [`src/styles/global.css`](src/styles/global.css) içinde tipografi için `:root` varsayılan değerleri ve `.typo-h1`–`.typo-h4`, `.typo-lead`, `.typo-body`, `.typo-small` sınıfları yer alır; renk (`--color-*`) değişkenleri ise tek kaynaktan (`theme.json`) `Layout.astro` üzerinden uygulanır.

---

## GEO / AEO / SEO ve Erişilebilirlik Mimarisi

- **Case-Sensitive Yazım ve Türkçe Kelime Bölme:**
  - Şablonlarda ve CSS'te zorunlu `uppercase` / `text-transform` kuralı bulunmaz; editörlerin CMS'e girdiği büyük/küçük harf biçimi sitede birebir korunur.
  - Tüm sayfalarda `<html lang="tr">` tanımlıdır ve `src/styles/global.css` içinde `body` için `-webkit-hyphens: auto; hyphens: auto; overflow-wrap: break-word; word-break: normal;` uygulanır; paragraf ve listelerde `text-wrap: pretty`, başlıklarda `text-wrap: balance` kullanılır.
  - Üst menü linkleri ve form/kod alanlarında otomatik tireleme kapalıdır (`hyphens: none`); klavye odağı ve form hataları için `:focus-visible` ve `:user-invalid` kuralları tanımlıdır.
- **Sayfa Bazlı SEO & GEO Kontrolü (`SeoGeoConfig`):**
  - Ana sayfa, 11 sabit alt sayfa, tüm projeler ve tüm blog yazıları CMS üzerinden bağımsız `<title>`, `description`, `keywords`, `canonical`, `robots`, `ogImage`, `ai-summary`, `schemaType`, `targetAudience`, `geoRegion`, `aboutTopics` ve `keyTakeaways` alanlarıyla düzenlenebilir.
- **Yapısal Veriler (JSON-LD):**
  - `Layout.astro`: Her sayfada `Organization`, sayfa hiyerarşisine göre `BreadcrumbList` ve sayfaya göre `WebPage` / `AboutPage` / `CollectionPage` / `Service` / `ContactPage` / `Article` / `BlogPosting`.
  - Yaklaşımımız / Neden Şimdi / Çözümler alt sayfaları: `FAQSection.astro` üzerinden `FAQPage`.
- **Keşif ve Yapay Zeka İndeksleme Dosyaları:**
  - `public/robots.txt` (`Sitemap: https://example.com/sitemap-index.xml`)
  - `@astrojs/sitemap` ile derleme anında oluşan `dist/sitemap-index.xml` ve `dist/sitemap-0.xml`
  - [`src/pages/llms.txt.ts`](src/pages/llms.txt.ts) ile JSON verilerinden derleme anında dinamik üretilen `/llms.txt`

---

## İçerik Güncelleme ve Vercel Yayın İş Akışı

### Yöntem 1: Admin Panelinden Tek Tıkla Yayınlama (Önerilen)
1. `http://localhost:4321/admin` adresinde içeriklerinizi düzenleyip kaydedin.
2. Sağ üstteki siyah **`▲ Vercel'e Yayınla ↗`** butonuna tıklayın.
3. İsteğe bağlı değişiklik notu yazıp **"Derle, GitHub'a Gönder ve Vercel'de Yayınla 🚀"** butonuna basın.
4. Panel önce yerel derlemeyi test eder (`npm run build`), ardından GitHub'a commit ve push gönderir. Vercel bunu otomatik algılayıp canlı siteyi günceller.

### Yöntem 2: Terminalden Manuel Yayınlama
```bash
# 1. Dosyaları ekleyin ve commit yapın
git add .
git commit -m "İçerik, medya ve tema güncellemeleri"

# 2. GitHub ana dalına gönderin
git push origin main
```
Komut biter bitmez Vercel otomatik olarak yayını hazırlar ve canlıya alır.

---

## Vercel Dağıtım ve Yapılandırma Notları

Proje GitHub üzerindeki `u736666/cx2222` deposu ile Vercel'e bağlıdır. Vercel proje panelindeki yapılandırma şöyledir:

| Ayar | Değer | Açıklama |
| --- | --- | --- |
| **Framework Preset** | `Astro` | Vercel otomatik olarak Astro çerçevesini tanır |
| **Install Command** | `npm install --legacy-peer-deps` | Astro ve Tailwind peer dependency uyumu için gereklidir |
| **Build Command** | `npm run build` | Astro statik üretim derlemesi |
| **Output Directory** | `dist` | Derlenen HTML ve statik varlıkların klasörü |
| **Production Branch**| `main` | Bu dala yapılan her push anında canlıya çıkar |
| **Canlı URL** | [https://example.com](https://example.com) | Doğrudan herkese açık ana adres |

---

## Canlı Ortam Öncesi Kontrol Listesi ve Notlar

- **Domain / Canonical URL:** Proje özel bir alan adına taşınacağı zaman [`astro.config.mjs`](astro.config.mjs) (`site`), [`public/robots.txt`](public/robots.txt) (`Sitemap`) ve [`src/data/site.json`](src/data/site.json) (`brand.siteUrl`) değerleri güncellenmelidir.
- **İletişim Formu:** [`src/components/ContactSection.astro`](src/components/ContactSection.astro) içindeki `#contact-form`; `/admin` → **Menü, Footer & İletişim** → **İletişim Formu & Ortak CTA** bölümünden **Form Webhook / POST URL (`formAction`)**, görünür/zorunlu alanlar ve **KVKK onay kutusu** ile yapılandırılır. `formAction` boş bırakıldığında istemci tarafında doğrulama ve anlık onay mesajı gösterir; gerçek gönderim için harici bir webhook veya form servisi (Formspree, Web3Forms vb.) uç noktası girilmelidir.
- **Tema & Tipografi Test Değerleri:** Yayına çıkmadan önce `/admin` → **Renkler & Tipografi** sekmesindeki **"Varsayılan cx2222 Paletine Sıfırla"** veya **"Tipografiyi Varsayılana Sıfırla"** butonlarını kullanarak orijinal ayarlara dönebilirsiniz.
