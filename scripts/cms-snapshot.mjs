// Refreshes the build fallback in src/data/cms/*.json from Supabase (published rows only).
// Run on the Mac: `node scripts/cms-snapshot.mjs`, then commit the JSON.
// The site normally reads Supabase live at build time (src/lib/cms.ts); this snapshot is only used
// when Supabase cannot be reached, so the build never breaks.
import { writeFile } from 'node:fs/promises';

const URL = process.env.PUBLIC_SUPABASE_URL || 'https://jkjuepbjuxpgodfpcdkn.supabase.co';
const KEY = process.env.PUBLIC_SUPABASE_KEY || 'sb_publishable_-XClinHHe4TgTzzDwh_-pA_lta9Q4kN';
const strip = ({ id, category_id, created_at, updated_at, ...rest }) => rest;
const sets = {
  posts: 'posts?status=eq.published&select=*,category:post_categories(name,slug)&order=published_at.desc.nullslast,sort',
  episodes: 'podcast_episodes?status=eq.published&select=*&order=published_at.desc.nullslast',
  videos: 'videos?status=eq.published&select=*&order=sort.nullslast',
  favorites: 'favorites?status=eq.published&select=*,category:favorite_categories(name,slug)&order=sort.nullslast,name',
  post_categories: 'post_categories?select=name,slug,sort&order=sort',
  favorite_categories: 'favorite_categories?select=name,slug,sort&order=sort',
};
for (const [file, path] of Object.entries(sets)) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY } });
  if (!res.ok) throw new Error(`${file}: ${res.status} ${await res.text()}`);
  const rows = (await res.json()).map(strip);
  await writeFile(new globalThis.URL(`../src/data/cms/${file}.json`, import.meta.url), JSON.stringify(rows, null, 1) + '\n');
  console.log(`${file}: ${rows.length}`);
}
