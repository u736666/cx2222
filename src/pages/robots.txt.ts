import type { APIRoute } from 'astro';
import { getSite } from '../lib/content';

export const GET: APIRoute = () => {
  const site = getSite();
  const siteUrl = (site.brand?.siteUrl || 'https://example.com').replace(/\/$/, '');
  const isNoIndex = site.brand?.noindex === true;

  if (isNoIndex) {
    return new Response(`User-agent: *\nDisallow: /\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const body = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
