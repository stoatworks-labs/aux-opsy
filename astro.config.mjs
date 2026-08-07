// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output, zero runtime dependencies — same posture as the main Stoatworks
// Labs site. `site` feeds the canonical tags, so it must stay in step with the
// custom domain attached in wrangler.jsonc.
export default defineConfig({
  site: 'https://aux-opsy.com',
  output: 'static',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  // Emits /sitemap-index.xml, which is the URL public/robots.txt advertises.
  integrations: [sitemap()],
});
