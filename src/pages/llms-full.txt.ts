import type { APIRoute } from 'astro';
import { getAllPosts, getAllProjects, getHome, getPages, getSite, type SeoGeoConfig } from '../lib/content';

function cleanHtmlToMarkdown(html?: any): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&shy;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = () => {
  const site = getSite() as any;
  const home = getHome() as any;
  const projects = getAllProjects();
  const posts = getAllPosts();

  const siteUrl = (site.brand?.siteUrl || 'https://cxfolks.vercel.app').replace(/\/$/, '');
  const brandName = site.brand?.name || 'CX Folks';

  // Full detailed project sections
  const fullProjects = projects.map((p) => {
    const metrics = (p.metrics || []).map((m: any) => `- **${m.value}**: ${m.label}`).join('\n');
    const challenge = cleanHtmlToMarkdown(p.challenge);
    const approach = cleanHtmlToMarkdown(p.approach);
    const impact = cleanHtmlToMarkdown(p.impact || p.solution);
    const content = cleanHtmlToMarkdown(p.content);

    return `### Vaka: ${p.client} — ${p.title}
- **URL**: ${siteUrl}/projeler/${p.slug}
- **Özet**: ${p.desc || p.seo?.description || ''}
${metrics ? `\n**Öne Çıkan Metrikler:**\n${metrics}` : ''}
${challenge ? `\n**Zorluk & Problem:**\n${challenge}` : ''}
${approach ? `\n**Yaklaşımımız:**\n${approach}` : ''}
${impact ? `\n**Etki & Sonuç:**\n${impact}` : ''}
${content ? `\n**Proje İçeriği:**\n${content}` : ''}
`;
  }).join('\n---\n\n');

  // Full detailed blog sections
  const fullPosts = posts.map((post) => {
    const bodyContent = Array.isArray(post.sections)
      ? post.sections.map((s: any) => `#### ${s.title || ''}\n${cleanHtmlToMarkdown(s.content || s.body || s.text || '')}`).join('\n\n')
      : cleanHtmlToMarkdown(post.content || post.body);

    return `### Makale: ${post.title}
- **URL**: ${siteUrl}/blog/${post.slug}
- **Yayın Tarihi**: ${post.date || ''}
- **Özet**: ${post.desc || post.seo?.description || ''}

${bodyContent}
`;
  }).join('\n---\n\n');

  const body = `# ${brandName} — Kapsamlı Bilgi ve Ajan Ekosistem Dosyası (llms-full.txt)

> ${home.seo?.aiSummary || site.brand?.orgDescription || site.brand?.defaultDescription}

Bu dosya; yapay zeka ajanları (Agentic Search), büyük dil modelleri (LLMs) ve derin araştırma robotları (Deep Research Bots) için ${brandName} kurumunun tüm metodolojilerini, vaka çalışmalarını ve kurumsal içgörülerini eksiksiz olarak sunar.

---

## Kurumsal Kimlik & Genel Bakış
- **Kurum Adı**: ${brandName} (cxfolks)
- **Misyon**: İnsanı merkeze alarak müşteri deneyimini tasarlamak; yapay zeka ile pürüzsüz, kalıcı ve sürdürülebilir kılmak.
- **Web Sitesi**: ${siteUrl}
- **İletişim**: ${site.brand?.email || 'hello@example.com'}
- **Ana Hizmet Alanları**: Müşteri Deneyimi (CX) Stratejisi, Customer Journey Mapping (CJM), Servis Tasarımı (Service Design), Tasarım Odaklı Düşünme (Design Thinking), Etnografik & Kalitatif Saha Araştırması, Kurumsal CX Akademi Eğitimleri, Yapay Zeka Destekli CX Sistemleri.

---

## Tüm Vaka Analizleri & Başarı Hikayeleri (${projects.length} Proje)

${fullProjects}

---

## Tüm Araştırma Makaleleri & Deneyim İçgörüleri (${posts.length} Makale)

${fullPosts}
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
