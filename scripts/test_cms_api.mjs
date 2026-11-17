import fs from 'fs';
import path from 'path';

// Test reading blockPages
const rootDir = process.cwd();
const absDir = path.join(rootDir, 'src/data/pages');
const entries = fs.readdirSync(absDir).filter(f => f.endsWith('.json'));

console.log('Detected block pages in src/data/pages:', entries.length);
entries.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(absDir, f), 'utf8'));
  console.log(` - ${f}: slug="${d.meta?.slug || ''}", blocks=${d.blocks?.length || 0}`);
});
