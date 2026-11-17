import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/data/pages/home.json', 'utf8'));
const logoBlock = data.blocks.find(b => b.type === 'logoMarquee');
console.log('LOGO BLOCK in home.json:', JSON.stringify(logoBlock, null, 2).substring(0, 500));
