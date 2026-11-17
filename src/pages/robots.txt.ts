import type { APIRoute } from 'astro';
import { getSite } from '../lib/content';

export const GET: APIRoute = ({ url }) => {
  const site = getSite() as any;
  const siteUrl = (url?.origin && !url.origin.includes('localhost') && !url.origin.includes('127.0.0.1'))
    ? url.origin
    : (site.brand?.siteUrl || 'https://cx2222.vercel.app').replace(/\/$/, '');
  const isNoIndex = site.brand?.noindex === true;

  if (isNoIndex) {
    return new Response(`User-agent: *\nDisallow: /\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const lines = [
    '# Standard Crawlers',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    '# OpenAI (ChatGPT & SearchGPT)',
    'User-agent: GPTBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    '# Perplexity AI',
    'User-agent: PerplexityBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    '# Anthropic Claude',
    'User-agent: ClaudeBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    '# Google Gemini & AI Overviews',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    '# Apple Intelligence',
    'User-agent: Applebot-Extended',
    'Allow: /',
    '',
    '# Cohere AI',
    'User-agent: Cohere-ai',
    'Allow: /',
    '',
    '# Meta AI Crawlers',
    'User-agent: meta-externalagent',
    'Allow: /',
    '',
    '# LLM Context Protocol',
    `Allow: /llms.txt`,
    '',
    '# Sitemaps',
    `Sitemap: ${siteUrl}/sitemap-index.xml`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
