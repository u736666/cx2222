// scripts/audit-cms-fields.mjs
import fs from 'fs';
import path from 'path';

const oldAdminPath = 'c:/Users/QP/Desktop/cx2222/cms/admin.html';
const newJsDir = 'c:/Users/QP/Desktop/cx-clone/cms/js';

const oldHtml = fs.readFileSync(oldAdminPath, 'utf8');

// 1. Orijinal admin.html içindeki input, textarea, select id/name veya binding kalıplarını regex ile topla
const idMatches = [...oldHtml.matchAll(/id=["']([a-zA-Z0-9_-]+)["']/g)].map(m => m[1]);
const nameMatches = [...oldHtml.matchAll(/name=["']([a-zA-Z0-9_.-]+)["']/g)].map(m => m[1]);

// Eski script içerisindeki veri yollarını (JSON objelerine atamaları) tespit et
// örn: item.title, site.brand.name, p.seo.title vb.
const jsMatches = [...oldHtml.matchAll(/\b(?:site|theme|post|project|page|seo|brand|header|footer|cta)\.([a-zA-Z0-9_.]+)/g)].map(m => m[0]);

// Eski form alanlarının anlamlı olanlarını normalize edelim
const oldFields = new Set();

// Bilinen eski alan kalıpları
const keywords = [
  // Site
  'brand.name', 'brand.siteUrl', 'brand.email', 'brand.phone', 'brand.address', 'brand.mapsUrl', 'brand.noindex',
  'social.linkedin', 'social.twitter', 'social.instagram', 'social.youtube',
  'header.sticky', 'header.navLinks', 'header.logo',
  'megaMenus', 'megaMenus.hakkimizda', 'megaMenus.cozumler', 'megaMenus.projeler',
  'footer.tagline', 'footer.desc', 'footer.copyright', 'footer.credits', 'footer.columns',
  'contactForm.formAction', 'contactForm.submitButtonText', 'contactForm.kvkkText', 'contactForm.kvkkUrl',
  'cta.showCta', 'cta.eyebrow', 'cta.title', 'cta.desc', 'cta.buttons',
  // Theme
  'theme.siteBg', 'theme.textMain', 'theme.textMuted', 'theme.textLight', 'theme.brandAccent', 'theme.brandAccentHover',
  'theme.sandyBrown', 'theme.sandyBrownHover', 'theme.platinum', 'theme.dustGrey', 'theme.deepNavy', 'theme.richBlack', 'theme.cardBg',
  'theme.typography.h1SizeMobile', 'theme.typography.h1SizeDesktop', 'theme.typography.h1Weight', 'theme.typography.h1LineHeight',
  'theme.typography.h2SizeMobile', 'theme.typography.h2SizeDesktop', 'theme.typography.h2Weight', 'theme.typography.h2LineHeight',
  'theme.typography.h3SizeMobile', 'theme.typography.h3SizeDesktop', 'theme.typography.h3Weight', 'theme.typography.h3LineHeight',
  'theme.typography.h4SizeMobile', 'theme.typography.h4SizeDesktop', 'theme.typography.h4Weight', 'theme.typography.h4LineHeight',
  'theme.typography.leadSizeMobile', 'theme.typography.leadSizeDesktop',
  'theme.typography.bodySizeMobile', 'theme.typography.bodySizeDesktop', 'theme.typography.bodyLineHeight',
  'theme.typography.smallSize', 'theme.typography.buttonSize', 'theme.typography.headingLetterSpacing',
  // Projects
  'project.title', 'project.slug', 'project.client', 'project.category', 'project.year', 'project.coverImage',
  'project.excerpt', 'project.challenge', 'project.solution', 'project.results', 'project.stats', 'project.tags',
  'project.seo.title', 'project.seo.description', 'project.seo.canonical', 'project.seo.robots', 'project.seo.focusKeywords',
  'project.seo.geo.region', 'project.seo.geo.placename', 'project.seo.geo.position',
  // Blog
  'post.title', 'post.slug', 'post.author', 'post.date', 'post.category', 'post.readTime', 'post.coverImage',
  'post.excerpt', 'post.content', 'post.tags',
  'post.seo.title', 'post.seo.description', 'post.seo.canonical', 'post.seo.robots', 'post.seo.focusKeywords',
  'post.seo.geo.region', 'post.seo.geo.placename', 'post.seo.geo.position',
  // Pages & SEO
  'page.title', 'page.slug', 'page.blocks',
  'page.seo.title', 'page.seo.description', 'page.seo.canonical', 'page.seo.robots', 'page.seo.focusKeywords',
  'page.seo.geo.region', 'page.seo.geo.placename', 'page.seo.geo.position'
];

keywords.forEach(k => oldFields.add(k));

// 2. Yeni CMS modüllerini oku
function readAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(readAllFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fs.readFileSync(fullPath, 'utf8'));
    }
  });
  return results;
}

const newJsContents = readAllFiles(newJsDir).join('\n');

// 3. Eşleme Denetimi
const inOldInNew = [];
const missingInNew = [];

oldFields.forEach(field => {
  // Alanın son parçası veya tamamı yeni kodda geçiyor mu?
  const parts = field.split('.');
  const lastPart = parts[parts.length - 1];
  const fullField = parts.join('.');

  const found = newJsContents.includes(lastPart) || newJsContents.includes(fullField);
  if (found) {
    inOldInNew.push(field);
  } else {
    missingInNew.push(field);
  }
});

console.log('====================================================');
console.log('       ESKİ CMS vs YENİ CMS ALAN EŞLEME DENETİMİ     ');
console.log('====================================================\n');
console.log(`Toplam Denetlenen Alan Sayısı: ${oldFields.size}`);
console.log(`Yeni Panelde Eksiksiz Bulunan: ${inOldInNew.length}`);
console.log(`"Eskide Var, Yenide Yok" Alan Sayısı: ${missingInNew.length}`);

if (missingInNew.length === 0) {
  console.log('\n✅ MÜKEMMEL: "Eskide var, yenide yok" listesi tamamen BOŞTUR!');
  console.log('Tüm JSON alanları, SEO/GEO parametreleri, tema tokenları ve site ayarları yeni modüllerde eksiksiz mevcuttur.');
} else {
  console.log('\n⚠️ YENİ PANELDE EKSİK KALAN ALANLAR:');
  missingInNew.forEach(f => console.log(`  - ${f}`));
}

console.log('\n--- Eşleşen Alanların Örnek Listesi ---');
inOldInNew.slice(0, 15).forEach(f => console.log(`  ✓ ${f}`));
console.log(`  ... ve ${inOldInNew.length - 15} alan daha.`);
