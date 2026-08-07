// @ts-check
import { defineConfig } from 'astro/config';

// Static output, zero runtime dependencies — same posture as the main Stoatworks
// Labs site. The site URL is provisional until the domain is decided; it is only
// used for canonical tags and the sitemap, so changing it later is a one-liner.
export default defineConfig({
  site: 'https://console-internals.stoatworks-labs.com',
  output: 'static',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
