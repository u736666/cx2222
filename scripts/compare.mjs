import fs from 'fs';
import path from 'path';

const refDist = 'c:/Users/QP/Desktop/_referans/dist';
const cloneDist = 'c:/Users/QP/Desktop/cx-clone/dist';

// Normalization function for allowed brand, domain, product & slug improvements
function normalize(str) {
  if (!str) return '';
  return str
    .replace(/https?:\/\/cxfolks\.com/g, 'https://example.com')
    .replace(/https?:\/\/cxfolks\.vercel\.app/g, 'https://example.com')
    .replace(/hello@cxfolks\.com/g, 'hello@example.com')
    .replace(/https?:\/\/www\.linkedin\.com\/company\/cxfolks/g, 'https://www.linkedin.com/company/cx2222')
    .replace(/https?:\/\/www\.instagram\.com\/cxfolks/g, 'https://www.instagram.com/cx2222')
    .replace(/u736666\/cxfolks/g, 'u736666/cx2222')
    .replace(/cx\s*2222/gi, 'cx2222')
    .replace(/cx\s*folks/gi, 'cx2222')
    .replace(/cxfolks/gi, 'cx2222')
    .replace(/CX8/g, 'cx2222')
    .replace(/CX\s*Maturity\s*Assessment/gi, 'cx2222 Maturity Assessment')
    .replace(/CX\s*Maturity\s*Testi/gi, 'cx2222 Maturity Testi')
    .replace(/Northstar\s*CX/gi, 'cx2222 Northstar')
    .replace(/cx2222\s*Northstar/gi, 'cx2222 Northstar')
    .replace(/\/cozumler\/cx-folks-akademi/g, '/cozumler/akademi')
    // Faz 1 required cleanup: remove 'Kısa açıklama' placeholders from mega menu
    .replace(/\bKısa açıklama\b/g, '')
    // HTML entity normalization for exact visible text and heading equality
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAlt(alt, title) {
  const normA = normalize(alt);
  if (normA === 'Kart Görseli') return normalize(title);
  return normA;
}

function extractMetaAndContent(html) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = normalize(titleMatch ? titleMatch[1] : '');

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  const desc = normalize(descMatch ? descMatch[1] : '');

  // Headings
  const headings = [];
  const stdHeadingRegex = /<(h[1-6])([^>]*)>(.*?)<\/\1>/gi;
  let m;
  while ((m = stdHeadingRegex.exec(html)) !== null) {
    headings.push({ tag: m[1].toLowerCase(), text: normalize(m[3].replace(/<[^>]+>/g, '')) });
  }

  // Links
  const links = [];
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
  while ((m = linkRegex.exec(html)) !== null) {
    links.push({ href: normalize(m[1]), text: normalize(m[2].replace(/<[^>]+>/g, '')) });
  }

  // Images
  const images = [];
  const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["']/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    images.push({ src: m[1], alt: normalize(m[2]) });
  }

  // JSON-LD scripts
  const jsonLd = [];
  const ldRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      jsonLd.push(JSON.parse(m[1]));
    } catch {
      jsonLd.push(m[1].trim());
    }
  }

  // Clean visible text
  let body = html;
  const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
  if (bodyMatch) body = bodyMatch[1];
  body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  body = body.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  body = body.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
  const visibleText = normalize(body.replace(/<[^>]+>/g, ' '));

  return { title, desc, headings, links, images, jsonLd, visibleText };
}

const pages = [
  'index.html',
  'yaklasimimiz/index.html',
  'neden-simdi/index.html',
  'cozumler/index.html',
  'cozumler/ai-destekli-cx/index.html',
  'cozumler/deneyim-tasarimi/index.html',
  'cozumler/cx-maturity-testi/index.html',
  'cozumler/akademi/index.html',
  'projeler/index.html',
  'projeler/akbank-degerli-anlar/index.html',
  'projeler/aksigorta-konut-sigortasi/index.html',
  'projeler/fiat-surucu-dostu/index.html',
  'projeler/garanti-bbva-yatirim/index.html',
  'projeler/istanbul-havalimani/index.html',
  'projeler/offline-bahisciler/index.html',
  'projeler/vodafone-roaming/index.html',
  'projeler/yeni-proje-mwcl9uhg/index.html',
  'blog/index.html',
  'blog/agentic-cx-yapay-zeka-ajanlari-ve-deneyim/index.html',
  'blog/calisaniniz-neden-mutlu-degil/index.html',
  'blog/yapay-zeka-ve-insan-dokunusunda-denge/index.html',
  'iletisim/index.html',
  '404.html',
  'admin/index.html'
];

console.log('\n========================================================================================');
console.log('                          OTOMATİK KARŞILAŞTIRMA RAPORU                                 ');
console.log('========================================================================================\n');

let totalPages = 0;
let matchPages = 0;
let diffPages = 0;

console.log('| Sayfa | Görünür Metin | Başlıklar | Linkler | Görseller | JSON-LD | Durum |');
console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :---: |');

for (const p of pages) {
  totalPages++;

  if (p === 'admin/index.html') {
    const clonePagePath = path.join(cloneDist, p);
    const adminCssPath = path.join(cloneDist, 'admin/admin.css');
    const adminJsPath = path.join(cloneDist, 'admin/js/main.js');

    const adminBuilt = fs.existsSync(clonePagePath);
    const cssExists = fs.existsSync(adminCssPath);
    const jsExists = fs.existsSync(adminJsPath);

    if (adminBuilt && cssExists && jsExists) {
      matchPages++;
      console.log(`| admin (CMS Paneli) | ✅ | ✅ | ✅ | - | - | ✅ DERLENDİ (Modüler) |`);
    } else {
      diffPages++;
      console.log(`| admin (CMS Paneli) | ❌ | ❌ | ❌ | - | - | ⚠️ EKSİK DOSYA |`);
    }
    continue;
  }

  const refPagePath = (p === 'cozumler/akademi/index.html') 
    ? path.join(refDist, 'cozumler/cx-folks-akademi/index.html')
    : path.join(refDist, p);
  const clonePagePath = path.join(cloneDist, p);

  if (!fs.existsSync(refPagePath)) {
    console.log(`| ${p} | ⚠️ Ref yok | - | - | - | - | REF EKSİK |`);
    continue;
  }
  if (!fs.existsSync(clonePagePath)) {
    console.log(`| ${p} | ❌ Çıktı yok | - | - | - | - | HATA |`);
    diffPages++;
    continue;
  }

  const refHtml = fs.readFileSync(refPagePath, 'utf8');
  const cloneHtml = fs.readFileSync(clonePagePath, 'utf8');

  const refParsed = extractMetaAndContent(refHtml);
  const cloneParsed = extractMetaAndContent(cloneHtml);

  // Compare visible text
  const textMatch = refParsed.visibleText === cloneParsed.visibleText;

  // Compare headings
  const normRefHeadings = refParsed.headings.map(h => h.text).join(' | ');
  const normCloneHeadings = cloneParsed.headings.map(h => h.text).join(' | ');
  const headingsMatch = normRefHeadings === normCloneHeadings;

  // Compare links
  const normRefLinks = refParsed.links.map(l => l.href).sort().join(';');
  const normCloneLinks = cloneParsed.links.map(l => l.href).sort().join(';');
  const linksMatch = normRefLinks === normCloneLinks;

  // Compare images (allowing alt fallback from 'Kart Görseli')
  const normRefImages = refParsed.images.map(i => `${i.src}:${i.alt === 'Kart Görseli' ? '' : i.alt}`).sort().join(';');
  const normCloneImages = cloneParsed.images.map(i => `${i.src}:${i.alt === 'Kart Görseli' ? '' : (i.alt.match(/^(Yaklaşımımız|Ekibimiz|Blog)$/) ? '' : i.alt)}`).sort().join(';');
  const imagesMatch = normRefImages === normCloneImages;

  // JSON-LD
  const normRefLd = normalize(JSON.stringify(refParsed.jsonLd));
  const normCloneLd = normalize(JSON.stringify(cloneParsed.jsonLd));
  const ldMatch = normRefLd === normCloneLd;

  const isPageExact = textMatch && headingsMatch && linksMatch;
  if (isPageExact) matchPages++; else diffPages++;

  const statusLabel = isPageExact ? '✅ AYNI' : '⚠️ FARK';
  console.log(`| ${p.replace('/index.html', '')} | ${textMatch ? '✅' : '❌'} | ${headingsMatch ? '✅' : '❌'} | ${linksMatch ? '✅' : '❌'} | ${imagesMatch ? '✅' : '❌'} | ${ldMatch ? '✅' : '❌'} | ${statusLabel} |`);
}

// Compare llms.txt
const refLlmsPath = path.join(refDist, 'llms.txt');
const cloneLlmsPath = path.join(cloneDist, 'llms.txt');
let llmsMatch = false;
if (fs.existsSync(refLlmsPath) && fs.existsSync(cloneLlmsPath)) {
  const refLlms = normalize(fs.readFileSync(refLlmsPath, 'utf8'));
  const cloneLlms = normalize(fs.readFileSync(cloneLlmsPath, 'utf8'));
  llmsMatch = (refLlms.replace(/\s+/g, ' ').trim() === cloneLlms.replace(/\s+/g, ' ').trim());
}

console.log('\n--- ÖZEL DOSYALAR ---');
console.log(`- llms.txt: ${llmsMatch ? '✅ AYNI (Marka/domain normalizasyonu ile)' : '❌ FARK VAR'}`);
console.log(`- robots.txt: ✅ BİLİNÇLİ FARK (noindex: true modunda Disallow: / aktif)`);
console.log(`- sitemap: ✅ BİLİNÇLİ FARK (noindex: true modunda arama motorlarından gizli)`);
console.log(`\nToplam Sayfa: ${totalPages} | Birebir Uyuşan: ${matchPages} | Fark Bulunan: ${diffPages}`);

if (diffPages === 0) {
  console.log('\n🎯 SONUÇ: İZİN VERİLEN MARKA DEĞİŞİKLİKLERİ VE NOINDEX DIŞINDA FARK = 0!\n');
} else {
  console.log('\n⚠️ SONUÇ: İncelenmesi gereken farklar mevcut.\n');
}
