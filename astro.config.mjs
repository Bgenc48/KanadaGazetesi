// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The custom domain is not currently delegated in DNS. Keep the public Pages
// fallback fully functional and switch back with KANADA_CUSTOM_DOMAIN=true
// after DNS and TLS have been verified.
const USE_CUSTOM_DOMAIN = process.env.KANADA_CUSTOM_DOMAIN === 'true';
const SITE = USE_CUSTOM_DOMAIN
  ? 'https://www.kanadagazetesi.com'
  : 'https://bgenc48.github.io/KanadaGazetesi';

export default defineConfig({
  site: SITE,
  base: USE_CUSTOM_DOMAIN ? '/' : '/KanadaGazetesi',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
