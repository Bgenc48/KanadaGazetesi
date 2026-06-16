// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Üretimde gerçek alan adıyla değiştirilecek.
const SITE = 'https://www.kanadagazetesi.com';

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
