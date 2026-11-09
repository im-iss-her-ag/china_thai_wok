// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: echte Domain eintragen (oder per ENV SITE_URL in Cloudflare Pages setzen)
const site = process.env.SITE_URL || 'https://www.china-thai-wok.de';

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
  // Seiten vorladen, sobald Links sichtbar sind → Wechsel Start ↔ Speisekarte ohne Wartezeit
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  // Chrome/Android: per Speculation Rules sogar vorrendern (Safari ignoriert es und nutzt normales Prefetch)
  experimental: { clientPrerender: true },
});
