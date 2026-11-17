import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const testFile = path.join(rootDir, 'src/data/pages/404.json');

const relPath = path.relative(rootDir, testFile);
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const backupDest = path.join(rootDir, '.cms-backups', stamp, relPath);

fs.mkdirSync(path.dirname(backupDest), { recursive: true });
fs.copyFileSync(testFile, backupDest);

console.log('Created backup successfully at:', backupDest);
console.log('Exists?', fs.existsSync(backupDest));
