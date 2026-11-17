import fs from 'fs';
const y = JSON.parse(fs.readFileSync('src/data/pages/yaklasimimiz.json', 'utf8'));
const b = y.blocks.find(x => x.type === 'approachManifesto');
console.log('BLOCK DATA:', JSON.stringify(b.data.manifesto, null, 2));
