import fs from 'fs';

const p = JSON.parse(fs.readFileSync('src/data/pages.json', 'utf8'));
const yBlock = JSON.parse(fs.readFileSync('src/data/pages/yaklasimimiz.json', 'utf8'));

const card5Pillar = {
  id: 'uygulanabilir-cozumler',
  title: 'Uygulanabilir Çözümler',
  tagline: '"Sunumda kalan projeler kaynak israfıdır."',
  p1: 'Hedeflerinize ve organizasyonel yapınıza en uygun yaklaşımı belirliyor ve sadece teoride kalan değil, doğrudan hayata geçirilebilir çözümler sunuyoruz.',
  p2: 'Sadece rapor veya sunumla kalmıyor; önerdiğimiz aksiyonların uygulama aşamasında da  yanınızda yer alarak sürecin sonuçlarını  sahipleniyoruz.',
  iconBg: ''
};

const card5Manifesto = {
  id: 'surekli-yasayan-kultur-manifesto',
  title: 'Sürekli Yaşayan Kültür',
  tagline: '"Dönüşüm bir proje değil, kurum DNA\'sına işleyen bir yolculuktur."',
  p1: 'Teorik danışmanlık raporları ve slayt sunumları çekmecelerde unutulmaya mahkumdur.',
  p2: 'Biz kurum içi elçiler yetiştirir, ekipleri sahada bizzat yetkinleştirir ve deneyim odaklı düşünmeyi şirketin kalıcı refleksine dönüştürürüz.',
  iconBg: ''
};

// Update pages.json
if (!p.yaklasimimiz.pillars.some(x => x.id === 'uygulanabilir-cozumler')) {
  p.yaklasimimiz.pillars.push(card5Pillar);
}
if (!p.yaklasimimiz.manifesto.items.some(x => x.id === 'surekli-yasayan-kultur-manifesto')) {
  p.yaklasimimiz.manifesto.items.push(card5Manifesto);
}
fs.writeFileSync('src/data/pages.json', JSON.stringify(p, null, 2), 'utf8');

// Update yaklasimimiz.json
const amBlock = yBlock.blocks.find(b => b.type === 'approachManifesto');
if (amBlock) {
  if (!amBlock.data.pillars.some(x => x.id === 'uygulanabilir-cozumler')) {
    amBlock.data.pillars.push(card5Pillar);
  }
  if (!amBlock.data.manifesto.items.some(x => x.id === 'surekli-yasayan-kultur-manifesto')) {
    amBlock.data.manifesto.items.push(card5Manifesto);
  }
}
fs.writeFileSync('src/data/pages/yaklasimimiz.json', JSON.stringify(yBlock, null, 2), 'utf8');
console.log('Added 5th cards successfully! Pillars len:', p.yaklasimimiz.pillars.length, 'Manifesto items len:', p.yaklasimimiz.manifesto.items.length);
