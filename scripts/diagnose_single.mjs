import fs from 'fs';
import path from 'path';

const page = process.argv[2] || 'yaklasimimiz/index.html';
const refDist = 'c:/Users/QP/Desktop/_referans/dist';
const cloneDist = 'c:/Users/QP/Desktop/cx-clone/dist';

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
    .replace(/\bKısa açıklama\b/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html) {
  const headings = [];
  const stdHeadingRegex = /<(h[1-6])([^>]*)>(.*?)<\/\1>/gi;
  let m;
  while ((m = stdHeadingRegex.exec(html)) !== null) {
    headings.push({ tag: m[1].toLowerCase(), text: normalize(m[3].replace(/<[^>]+>/g, '')) });
  }

  const links = [];
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
  while ((m = linkRegex.exec(html)) !== null) {
    links.push({ href: normalize(m[1]), text: normalize(m[2].replace(/<[^>]+>/g, '')) });
  }

  const images = [];
  const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["']/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    images.push({ src: m[1], alt: normalize(m[2]) });
  }

  let body = html;
  const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
  if (bodyMatch) body = bodyMatch[1];
  body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  body = body.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  body = body.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
  const visibleText = normalize(body.replace(/<[^>]+>/g, ' '));

  return { headings, links, images, visibleText };
}

const refPagePath = (page === 'cozumler/akademi/index.html')
  ? path.join(refDist, 'cozumler/cx-folks-akademi/index.html')
  : path.join(refDist, page);
const clonePagePath = path.join(cloneDist, page);

const refHtml = fs.readFileSync(refPagePath, 'utf8');
const cloneHtml = fs.readFileSync(clonePagePath, 'utf8');

const ref = extract(refHtml);
const clone = extract(cloneHtml);

console.log('=== CHECKING:', page, '===');
console.log('Text equal?', ref.visibleText === clone.visibleText);
if (ref.visibleText !== clone.visibleText) {
  console.log('Ref text length:', ref.visibleText.length);
  console.log('Clone text length:', clone.visibleText.length);
  let i = 0;
  while (i < ref.visibleText.length && i < clone.visibleText.length && ref.visibleText[i] === clone.visibleText[i]) i++;
  console.log('First diff at', i);
  console.log('REF  :', ref.visibleText.substring(Math.max(0, i - 30), i + 70));
  console.log('CLONE:', clone.visibleText.substring(Math.max(0, i - 30), i + 70));
}

console.log('\nHeadings equal?', JSON.stringify(ref.headings) === JSON.stringify(clone.headings));
if (JSON.stringify(ref.headings) !== JSON.stringify(clone.headings)) {
  console.log('REF HEADINGS:');
  ref.headings.forEach(h => console.log(`  <${h.tag}>: ${h.text}`));
  console.log('CLONE HEADINGS:');
  clone.headings.forEach(h => console.log(`  <${h.tag}>: ${h.text}`));
}

console.log('\nLinks equal?', JSON.stringify(ref.links.sort()) === JSON.stringify(clone.links.sort()));
if (JSON.stringify(ref.links.sort()) !== JSON.stringify(clone.links.sort())) {
  const refSet = new Set(ref.links.map(l => `${l.href} [${l.text}]`));
  const cloneSet = new Set(clone.links.map(l => `${l.href} [${l.text}]`));
  console.log('REF only:', [...refSet].filter(x => !cloneSet.has(x)));
  console.log('CLONE only:', [...cloneSet].filter(x => !refSet.has(x)));
}

console.log('\nImages equal?', JSON.stringify(ref.images) === JSON.stringify(clone.images));
if (JSON.stringify(ref.images) !== JSON.stringify(clone.images)) {
  console.log('REF IMAGES:', ref.images);
  console.log('CLONE IMAGES:', clone.images);
}
