async function check() {
  const r = await fetch('https://cx2222.vercel.app/robots.txt').then(res => res.text());
  const s = await fetch('https://cx2222.vercel.app/sitemap-0.xml').then(res => res.text());
  const l = await fetch('https://cx2222.vercel.app/llms.txt').then(res => res.text());
  const h = await fetch('https://cx2222.vercel.app/').then(res => res.text());
  
  console.log('Robots Sitemaps line:', r.split('\n').filter(x => x.includes('Sitemap:')));
  console.log('Sitemap has cx2222?:', s.includes('https://cx2222.vercel.app'));
  console.log('Sitemap has cxfolks?:', s.includes('cxfolks.vercel.app'));
  console.log('LLMS.txt size:', l.length, 'Contains cx2222?:', l.includes('https://cx2222.vercel.app'));
  console.log('Home FAQPage Schema?:', h.includes('"@type":"FAQPage"'));
}
check();
