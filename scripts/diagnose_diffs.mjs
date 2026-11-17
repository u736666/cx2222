import fs from 'fs';
import path from 'path';

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
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMetaAndContent(html) {
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

  let body = html;
  const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
  if (bodyMatch) body = bodyMatch[1];
  body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  body = body.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  body = body.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
  const visibleText = normalize(body.replace(/<[^>]+>/g, ' '));

  return { headings, links, images, visibleText };
}

const targetPages = [
  'index.html',
  'yaklasimimiz/index.html',
  'neden-simdi/index.html',
  'cozumler/index.html',
  'cozumler/ai-destekli-cx/index.html',
  'cozumler/deneyim-tasarimi/index.html',
  'cozumler/cx-maturity-testi/index.html',
  'cozumler/akademi/index.html',
  'projeler/index.html',
  'blog/index.html'
];

for (const p of targetPages) {
  const refPagePath = (p === 'cozumler/akademi/index.html') 
    ? path.join(refDist, 'cozumler/cx-folks-akademi/index.html')
    : path.join(refDist, p);
  const clonePagePath = path.join(cloneDist, p);

  const refHtml = fs.readFileSync(refPagePath, 'utf8');
  const cloneHtml = fs.readFileSync(clonePagePath, 'utf8');

  const ref = extractMetaAndContent(refHtml);
  const clone = extractMetaAndContent(cloneHtml);

  console.log(`\n=================== [ ${p} ] ===================`);
  if (ref.visibleText !== clone.visibleText) {
    console.log('--- VISIBLE TEXT DIFF ---');
    console.log('Ref length:', ref.visibleText.length, 'Clone length:', clone.visibleText.length);
    // Find first difference
    let i = 0;
    while (i < ref.visibleText.length && i < clone.visibleText.length && ref.visibleText[i] === clone.visibleText[i]) {
      i++;
    }
    console.log('First diff at index', i);
    console.log('REF around diff  :', ref.visibleText.substring(Math.max(0, i - 40), i + 60));
    console.log('CLONE around diff:', clone.visibleText.substring(Math.max(0, i - 40), i + 60));
  } else {
    console.log('Visible Text: ✅ MATCH');
  }

  const normRefHeadings = ref.headings.map(h => `${h.tag}:${h.text}`).join(' | ');
  const normCloneHeadings = clone.headings.map(h => `${h.tag}:${h.text}`).join(' | ');
  if (normRefHeadings !== normCloneHeadings) {
    console.log('--- HEADINGS DIFF ---');
    console.log('REF  :', normRefHeadings);
    console.log('CLONE:', normCloneHeadings);
  } else {
    console.log('Headings: ✅ MATCH');
  }

  const normRefLinks = ref.links.map(l => l.href).sort().join(';');
  const normCloneLinks = clone.links.map(l => l.href).sort().join(';');
  if (normRefLinks !== normCloneLinks) {
    console.log('--- LINKS DIFF ---');
    const refSet = new Set(ref.links.map(l => l.href));
    const cloneSet = new Set(clone.links.map(l => l.href));
    console.log('In ref but not clone:', [...refSet].filter(x => !cloneSet.has(x)));
    console.log('In clone but not ref:', [...cloneSet].filter(x => !refSet.has(x)));
  } else {
    console.log('Links: ✅ MATCH');
  }

  const normRefImages = ref.images.map(i => `${i.src}:${i.alt}`).sort().join(';');
  const normCloneImages = clone.images.map(i => `${i.src}:${i.alt}`).sort().join(';');
  if (normRefImages !== normCloneImages) {
    console.log('--- IMAGES DIFF ---');
    console.log('REF imgs  :', ref.images);
    console.log('CLONE imgs:', clone.images);
  } else {
    console.log('Images: ✅ MATCH');
  }
}
