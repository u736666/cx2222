import fs from 'fs';

const cz = JSON.parse(fs.readFileSync('src/data/pages/cozumler.json', 'utf8'));
const pages = JSON.parse(fs.readFileSync('src/data/pages.json', 'utf8'));

const sl = cz.blocks.find(b => b.type === 'solutionsList');
if (sl && Array.isArray(sl.data?.items)) {
  sl.data.items.forEach((item, idx) => {
    if (!item.badge && item.badge !== '') {
      item.badge = `Çözüm 0${idx + 1}`;
    }
    if (item.slug === 'ai-destekli-cx') {
      item.btnLabel = 'Detaylı Çözümleri İncele';
    } else if (!item.btnLabel) {
      item.btnLabel = 'Detaylı Metodolojiyi İncele →';
    }
  });
}
fs.writeFileSync('src/data/pages/cozumler.json', JSON.stringify(cz, null, 2), 'utf8');

if (pages.cozumlerIndex && Array.isArray(pages.cozumlerIndex.solutions)) {
  pages.cozumlerIndex.solutions.forEach((item, idx) => {
    if (!item.badge && item.badge !== '') {
      item.badge = `Çözüm 0${idx + 1}`;
    }
    if (item.slug === 'ai-destekli-cx') {
      item.btnLabel = 'Detaylı Çözümleri İncele';
    } else if (!item.btnLabel) {
      item.btnLabel = 'Detaylı Metodolojiyi İncele →';
    }
  });
  fs.writeFileSync('src/data/pages.json', JSON.stringify(pages, null, 2), 'utf8');
}
console.log('Updated cozumler solutions with badges and button labels!');
