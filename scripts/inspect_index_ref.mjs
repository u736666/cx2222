import fs from 'fs';
const refHtml = fs.readFileSync('../_referans/dist/index.html', 'utf8');
const cloneHtml = fs.readFileSync('dist/index.html', 'utf8');

const refImgs = [...refHtml.matchAll(/<img[^>]*>/g)].map(m => m[0]);
const cloneImgs = [...cloneHtml.matchAll(/<img[^>]*>/g)].map(m => m[0]);

console.log('REF IMAGES COUNT:', refImgs.length);
console.log('CLONE IMAGES COUNT:', cloneImgs.length);

console.log('\nREF IMGS:');
refImgs.forEach(img => console.log(' ', img));

console.log('\nCLONE IMGS:');
cloneImgs.forEach(img => console.log(' ', img));
