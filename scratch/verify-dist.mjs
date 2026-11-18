import fs from 'fs';

const index = fs.readFileSync('dist/index.html', 'utf8');
const iletisim = fs.readFileSync('dist/iletisim/index.html', 'utf8');
const pNew = fs.readFileSync('dist/projeler/yeni-proje-mwcl9uhg/index.html', 'utf8');

console.log('Index Canonical:', index.match(/<link rel="canonical" href="([^"]+)"/)?.[1]);
console.log('Index FAQ Schema Present?:', index.includes('"@type":"FAQPage"'));
console.log('Iletisim H1:', iletisim.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[0]);
console.log('Yeni Proje Desc:', pNew.match(/<meta name="description" content="([^"]+)"/)?.[1]);
