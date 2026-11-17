import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cx2222CmsPlugin from './cms/dev-plugin.mjs';
import fs from 'fs';

// Read brand configuration dynamically from site.json
const siteData = JSON.parse(fs.readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'));
const siteUrl = siteData.brand?.siteUrl || 'https://example.com';
const isNoIndex = siteData.brand?.noindex === true;

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'static',
  trailingSlash: 'never',
  redirects: {
    '/cozumler/cx-folks-akademi': '/cozumler/akademi',
  },
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !isNoIndex && !page.includes('/404') && !page.includes('/admin'),
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [cx2222CmsPlugin()],
  },
});
