import fs from 'fs';
import path from 'path';

const refDist = 'c:/Users/QP/Desktop/_referans/dist';
const cloneDist = 'c:/Users/QP/Desktop/cx-clone/dist';

function getFiles(dir, base = '') {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name !== '_astro') {
        res = res.concat(getFiles(full, rel));
      }
    } else {
      res.push(rel);
    }
  }
  return res;
}

const refFiles = getFiles(refDist).sort();
const cloneFiles = getFiles(cloneDist).sort();

console.log('=== REF DIST FILES ===', refFiles.length);
refFiles.forEach(f => console.log('  REF:', f));

console.log('\n=== CLONE DIST FILES ===', cloneFiles.length);
cloneFiles.forEach(f => console.log('  CLONE:', f));

const inCloneOnly = cloneFiles.filter(f => !refFiles.includes(f));
const inRefOnly = refFiles.filter(f => !cloneFiles.includes(f));

console.log('\nIn CLONE only:', inCloneOnly);
console.log('In REF only:', inRefOnly);
