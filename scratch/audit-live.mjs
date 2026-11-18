import https from 'node:https';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function audit() {
  console.log('=== STARTING AUTOMATED AUDIT FOR https://cx2222.vercel.app/ ===\n');
  const home = await fetch('https://cx2222.vercel.app/');
  console.log('1. HTTP Status:', home.status);
  console.log('   Security Headers:');
  console.log('   - x-content-type-options:', home.headers['x-content-type-options']);
  console.log('   - x-frame-options:', home.headers['x-frame-options']);
  console.log('   - referrer-policy:', home.headers['referrer-policy']);
  console.log('   - permissions-policy:', home.headers['permissions-policy']);

  const html = home.body;

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  console.log('\n2. Meta Tags:');
  console.log('   - Title:', titleMatch ? titleMatch[1] : 'MISSING');

  // Description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  console.log('   - Meta Description:', descMatch ? descMatch[1] : 'MISSING');

  // Canonical
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  console.log('   - Canonical:', canonMatch ? canonMatch[1] : 'MISSING');

  // AI-Summary
  const aiSummaryMatch = html.match(/<meta[^>]+name=["']ai-summary["'][^>]+content=["']([^"']+)["']/i);
  console.log('   - AI-Summary (GEO):', aiSummaryMatch ? aiSummaryMatch[1].slice(0, 100) + '...' : 'MISSING');

  // Robots
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  console.log('   - Meta Robots:', robotsMatch ? robotsMatch[1] : 'MISSING');

  // OpenGraph
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  console.log('\n3. Social / OpenGraph Tags:');
  console.log('   - og:title:', ogTitle ? ogTitle[1] : 'MISSING');
  console.log('   - og:description:', ogDesc ? ogDesc[1].slice(0, 80) + '...' : 'MISSING');
  console.log('   - og:image:', ogImg ? ogImg[1] : 'MISSING');
  console.log('   - og:url:', ogUrl ? ogUrl[1] : 'MISSING');

  // JSON-LD
  console.log('\n4. Structured Data (JSON-LD):');
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log('   - Total JSON-LD blocks found:', jsonLdMatches.length);
  jsonLdMatches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      console.log(`   - Block #${idx + 1}:`, parsed['@type'] || (parsed['@graph'] ? 'Graph with ' + parsed['@graph'].map(g => g['@type']).join(', ') : 'Unknown'));
    } catch (e) {
      console.log(`   - Block #${idx + 1} JSON Parse Error:`, e.message);
    }
  });

  // Headings
  console.log('\n5. Heading Structure:');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('   - H1 count:', h1s.length, '->', h1s);
  console.log('   - H2 count:', h2s.length, '->', h2s.slice(0, 5));

  // Images without alt
  const imgs = [...html.matchAll(/<img([^>]+)>/gi)];
  const imgsWithoutAlt = imgs.filter(m => !m[1].includes('alt=') || m[1].includes('alt=""'));
  console.log('\n6. Images:');
  console.log('   - Total <img> tags:', imgs.length);
  console.log('   - Missing or empty alt:', imgsWithoutAlt.length);

  // llms.txt
  console.log('\n7. /llms.txt Check:');
  const llms = await fetch('https://cx2222.vercel.app/llms.txt');
  console.log('   - Status:', llms.status, 'Size:', llms.body.length, 'bytes');
  console.log('   - Contains H1 Title:', llms.body.startsWith('# '));
  console.log('   - Contains Core Capabilities:', llms.body.includes('Temel Yetkinlikler'));
  console.log('   - Contains FAQ / Answers:', llms.body.includes('Sıkça Sorulan Sorular'));

  // robots.txt
  console.log('\n8. /robots.txt Check:');
  const robots = await fetch('https://cx2222.vercel.app/robots.txt');
  console.log('   - Status:', robots.status);
  console.log('   - Content:\n' + robots.body);
}

audit().catch(console.error);
