import fs from 'fs';
import path from 'path';

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html') && !file.includes('admin') && !file.includes('404')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles('dist');
console.log(`Auditing ${htmlFiles.length} generated production pages in dist/...\n`);

let issues = 0;
for (const file of htmlFiles) {
  const relPath = path.relative('dist', file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  // 1. Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    console.error(`[FAIL] ${relPath}: Missing title`);
    issues++;
  }

  // 2. Meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!descMatch || descMatch[1].length < 40) {
    console.error(`[FAIL] ${relPath}: Short or missing meta description (${descMatch ? descMatch[1].length : 0} chars)`);
    issues++;
  }

  // 3. AI Summary (GEO)
  const aiSummaryMatch = html.match(/<meta\s+name="ai-summary"\s+content="([^"]*)"/i);
  if (!aiSummaryMatch || !aiSummaryMatch[1].trim()) {
    console.error(`[FAIL] ${relPath}: Missing meta ai-summary`);
    issues++;
  }

  // 4. H1 tag
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match || !h1Match[1].trim()) {
    console.error(`[FAIL] ${relPath}: Missing H1 heading`);
    issues++;
  }

  // 5. Canonical domain
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (!canonicalMatch || !canonicalMatch[1].startsWith('https://cx2222.vercel.app')) {
    console.error(`[FAIL] ${relPath}: Canonical mismatch: ${canonicalMatch ? canonicalMatch[1] : 'none'}`);
    issues++;
  }

  // 6. JSON-LD structured data
  const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!jsonLdMatch) {
    console.error(`[FAIL] ${relPath}: Missing JSON-LD schema`);
    issues++;
  }
}

console.log(`Audit finished with ${issues} issues across ${htmlFiles.length} pages.`);
if (issues === 0) {
  console.log('✅ ALL PAGES 100% PERFECT: Titles, Descriptions, AI-Summaries, H1s, Schemas, and Canonical URLs!');
}
