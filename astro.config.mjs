// @ts-check
import { defineConfig } from 'astro/config';
import basePath from './integrations/base-path.mjs';

// Where the site is served from. Local dev and the eventual drlentau.com launch: the domain root.
// GitHub Pages preview sets SITE_URL=https://aklepner.github.io and SITE_BASE=/drlentau1 (see .github/workflows/deploy.yml).
const SITE_URL = process.env.SITE_URL || 'https://drlentau.com';
const SITE_BASE = process.env.SITE_BASE || '/';

// Static output today. When Supabase arrives, add an adapter (Netlify, Vercel or Node)
// and set `export const prerender = false` only on the pages/endpoints that need a server.
export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE,
  output: 'static',
  build: { format: 'directory' },
  integrations: [basePath()],
  // Old drlentau.com URLs that moved. Keep these so links in the wild still work.
  redirects: {
    '/about': '/meet',
    '/connect': '/contact',
    '/helpful-articles': '/news',
    '/latest-news': '/news',
  },
});
