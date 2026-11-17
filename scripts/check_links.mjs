import fs from 'fs';
const cloneHtml = fs.readFileSync('dist/yaklasimimiz/index.html', 'utf8');
const links = [...cloneHtml.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis)].map(m => ({
  href: m[1],
  text: m[2].replace(/<[^>]+>/g, '').trim()
}));
console.log('CLONE links with /yaklasimimiz:', links.filter(l => l.href.includes('yaklasimimiz')));
