import https from 'node:https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== MULTI-PAGE AUDIT FOR https://cx2222.vercel.app/ ===\n');
  const sitemapRes = await fetchUrl('https://cx2222.vercel.app/sitemap-0.xml');
  const urls = [...sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`Discovered ${urls.length} URLs in sitemap:\n`);

  const results = [];
  for (const origUrl of urls) {
    // Replace domain to test cx2222.vercel.app
    const testUrl = origUrl.replace('https://cxfolks.vercel.app', 'https://cx2222.vercel.app');
    try {
      const res = await fetchUrl(testUrl);
      const html = res.body;

      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
      const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
      const aiSummary = html.match(/<meta[^>]+name=["']ai-summary["'][^>]+content=["']([^"']+)["']/i);
      const jsonLdCount = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["']/gi)].length;
      const h1Count = [...html.matchAll(/<h1[^>]*>/gi)].length;
      const imgsWithoutAlt = [...html.matchAll(/<img([^>]+)>/gi)].filter(m => !m[1].includes('alt=') || m[1].includes('alt=""')).length;

      results.push({
        url: testUrl,
        status: res.status,
        title: titleMatch ? titleMatch[1] : null,
        descLength: descMatch ? descMatch[1].length : 0,
        canonical: canonMatch ? canonMatch[1] : null,
        hasAiSummary: Boolean(aiSummary),
        jsonLdCount,
        h1Count,
        imgsWithoutAlt,
        contentSize: html.length
      });
      process.stdout.write('.');
    } catch (err) {
      console.error(`Error on ${testUrl}:`, err.message);
    }
  }

  console.log('\n\n=== AUDIT SUMMARY RESULTS ===');
  console.log(`Total Pages Audited: ${results.length}`);
  const status200 = results.filter(r => r.status === 200).length;
  console.log(`HTTP 200 Success: ${status200}/${results.length}`);

  const missingTitle = results.filter(r => !r.title);
  console.log(`Missing Title: ${missingTitle.length}`);

  const shortDesc = results.filter(r => r.descLength < 50);
  console.log(`Short/Missing Description (<50 chars): ${shortDesc.length}`);
  if (shortDesc.length > 0) shortDesc.forEach(s => console.log('  -> Short Desc:', s.url));

  const missingAiSummary = results.filter(r => !r.hasAiSummary);
  console.log(`Missing AI Summary (GEO): ${missingAiSummary.length}`);

  const missingSchema = results.filter(r => r.jsonLdCount === 0);
  console.log(`Missing Structured Data (JSON-LD): ${missingSchema.length}`);

  const zeroH1 = results.filter(r => r.h1Count === 0);
  console.log(`Missing H1 Heading: ${zeroH1.length}`);
  if (zeroH1.length > 0) zeroH1.forEach(z => console.log('  -> No H1:', z.url));

  const imgsAltIssues = results.filter(r => r.imgsWithoutAlt > 0);
  console.log(`Pages with Missing Alt Tags: ${imgsAltIssues.length}`);

  const canonMismatches = results.filter(r => r.canonical && !r.canonical.startsWith('https://cx2222.vercel.app'));
  console.log(`Canonical Domain Mismatches: ${canonMismatches.length}`);
  if (canonMismatches.length > 0) {
    console.log(`Sample Canonical Mismatch: Page ${canonMismatches[0].url} -> Canonical: ${canonMismatches[0].canonical}`);
  }
}

run().catch(console.error);
