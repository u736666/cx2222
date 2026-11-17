import type { APIRoute } from 'astro';
import { getAllPosts, getAllProjects, getHome, getPages, getSite, type SeoGeoConfig } from '../lib/content';

function formatSeoGeoEntry(url: string, fallbackTitle: string, fallbackDesc: string, seo?: SeoGeoConfig) {
  if (seo?.llmsInclude === false) return null;
  const title = seo?.title || fallbackTitle;
  const summary = seo?.aiSummary || seo?.description || fallbackDesc;
  const takeaways = Array.isArray(seo?.keyTakeaways) ? seo.keyTakeaways.filter(Boolean) : [];
  const topics = Array.isArray(seo?.aboutTopics) ? seo.aboutTopics.filter(Boolean) : [];

  const lines = [`- [${title}](${url}): ${summary}`];
  if (topics.length > 0) {
    lines.push(`  - Konular: ${topics.join(', ')}`);
  }
  if (takeaways.length > 0) {
    lines.push(`  - Temel Çıkarımlar: ${takeaways.join(' | ')}`);
  }
  return lines.join('\n');
}

export const GET: APIRoute = () => {
  const site = getSite() as any;
  const home = getHome() as any;
  const pages = getPages() as any;
  const projects = getAllProjects();
  const posts = getAllPosts();

  const siteUrl = (site.brand?.siteUrl || 'https://example.com').replace(/\/$/, '');
  const brandName = site.brand?.name || 'cx2222';

  const pageEntries: Array<[string, string, string, SeoGeoConfig | undefined]> = [
    [`${siteUrl}/`, 'Ana Sayfa', site.brand?.defaultDescription || '', home.seo],
    [`${siteUrl}/yaklasimimiz`, 'Yaklaşımımız', '', pages.yaklasimimiz?.seo],
    [`${siteUrl}/neden-simdi`, 'Neden Şimdi?', '', pages.nedenSimdi?.seo],
    [`${siteUrl}/cozumler`, 'Çözümler', '', pages.cozumlerIndex?.seo],
    [`${siteUrl}/cozumler/ai-destekli-cx`, 'AI Destekli CX', '', pages.aiDestekliCx?.seo],
    [`${siteUrl}/cozumler/deneyim-tasarimi`, 'Deneyim Tasarımı', '', pages.deneyimTasarimi?.seo],
    [`${siteUrl}/cozumler/akademi`, 'cx2222 Akademi', '', (pages as any).akademi?.seo],
    [`${siteUrl}/cozumler/cx-maturity-testi`, 'cx2222 Maturity Testi', '', (pages as any).cxMaturityTesti?.seo],
    [`${siteUrl}/projeler`, 'Projeler', '', pages.projelerIndex?.seo],
    [`${siteUrl}/blog`, 'Blog', '', pages.blogIndex?.seo],
    [`${siteUrl}/iletisim`, 'İletişim', '', pages.iletisim?.seo],
  ];

  const formattedPages = pageEntries
    .map(([url, fallbackTitle, fallbackDesc, seo]) => formatSeoGeoEntry(url, fallbackTitle, fallbackDesc, seo))
    .filter(Boolean)
    .join('\n');

  const formattedProjects = projects
    .map((p) => {
      const base = formatSeoGeoEntry(`${siteUrl}/projeler/${p.slug}`, `${p.client} — ${p.title}`, p.desc, p.seo);
      if (!base) return null;
      const metrics = (p.metrics || []).map((m) => `${m.value} ${m.label}`).join(', ');
      return metrics ? `${base}\n  - Metrikler: ${metrics}` : base;
    })
    .filter(Boolean)
    .join('\n');

  const formattedPosts = posts
    .map((post) => formatSeoGeoEntry(`${siteUrl}/blog/${post.slug}`, `${post.title} (${post.date})`, post.desc, post.seo))
    .filter(Boolean)
    .join('\n');

  const body = `# ${brandName}

> ${home.seo?.aiSummary || site.brand?.orgDescription || site.brand?.defaultDescription}

## Kurumsal Bilgiler
- E-posta: ${site.brand?.email || ''}
- Ofisler: ${site.brand?.officesSummary || ''}
- Site: ${siteUrl}

## Temel Sayfalar & Çözümler
${formattedPages}

## Örnek Vaka Analizleri (${projects.length})
${formattedProjects}

## İçgörüler & Blog Yazıları (${posts.length})
${formattedPosts}
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
