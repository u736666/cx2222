import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/QP/Desktop/cx-clone/src/data/pages';
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const cta = (data.blocks || []).find(b => b.type === 'ctaBanner');
  if (cta) {
    console.log(file, 'cta data:', {
      visible: cta.visible,
      selectedCtaId: cta.data?.selectedCtaId,
      title: cta.data?.title,
      desc: cta.data?.desc ? cta.data.desc.slice(0, 30) + '...' : ''
    });
  }
}
