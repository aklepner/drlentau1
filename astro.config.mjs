// @ts-check
import { defineConfig } from 'astro/config';

// Static output today. When Supabase arrives, add an adapter (Netlify, Vercel or Node)
// and set `export const prerender = false` only on the pages/endpoints that need a server.
export default defineConfig({
  site: 'https://drlentau.com',
  output: 'static',
  build: { format: 'directory' },
  // Old drlentau.com URLs that moved. Keep these so links in the wild still work.
  redirects: {
    '/about': '/meet',
    '/connect': '/contact',
    '/helpful-articles': '/news',
    '/latest-news': '/news',
  },
});
