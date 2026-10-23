/**
 * Content from Supabase (posts, podcast episodes, videos, favorites), read at build time.
 *
 * Len edits content in the admin area (/admin/). Saving there triggers a rebuild of the site,
 * and this file pulls the published rows during that build.
 *
 * If Supabase cannot be reached (offline laptop, blocked network), the build falls back to the
 * snapshot in src/data/cms/*.json so it never breaks. Refresh the snapshot with
 * `node scripts/cms-snapshot.mjs` (run it on the Mac, then commit the JSON).
 *
 * The URL and publishable key are public by design: Row Level Security only lets them read
 * published rows. Never put the secret/service key here.
 */
import postsSnap from '../data/cms/posts.json';
import episodesSnap from '../data/cms/episodes.json';
import videosSnap from '../data/cms/videos.json';
import favoritesSnap from '../data/cms/favorites.json';
import postCatsSnap from '../data/cms/post_categories.json';
import favCatsSnap from '../data/cms/favorite_categories.json';

export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://jkjuepbjuxpgodfpcdkn.supabase.co';
export const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_KEY || 'sb_publishable_-XClinHHe4TgTzzDwh_-pA_lta9Q4kN';

export interface Cat { name: string; slug: string; sort?: number | null }
export interface Post {
  slug: string; title: string; category: Cat | null; author?: string | null; excerpt?: string | null;
  content_html?: string | null; image_url?: string | null; image_alt?: string | null;
  seo_title?: string | null; seo_description?: string | null; og_image_url?: string | null;
  published_at?: string | null; sort?: number | null;
}
export interface Episode {
  slug: string; number?: number | null; season?: number | null; title: string; guest?: string | null;
  summary?: string | null; body_html?: string | null; audio_embed_url?: string | null; video_embed_url?: string | null;
  image_url?: string | null; image_alt?: string | null; seo_title?: string | null; seo_description?: string | null;
  published_at?: string | null;
}
export interface Video {
  slug: string; title: string; source?: string | null; summary?: string | null; body_html?: string | null;
  embed_url?: string | null; image_url?: string | null; image_alt?: string | null;
  seo_title?: string | null; seo_description?: string | null; published_at?: string | null; sort?: number | null;
}
export interface Favorite {
  slug: string; name: string; category: Cat | null; description?: string | null; body_html?: string | null;
  website_url?: string | null; logo_url?: string | null; logo_alt?: string | null; featured?: boolean | null;
  sort?: number | null; seo_title?: string | null; seo_description?: string | null;
}

const cache = new Map<string, Promise<any[]>>();
let warned = false;

async function rest<T>(path: string, fallback: T[]): Promise<T[]> {
  if (process.env.CMS_OFFLINE === 'true') return fallback;
  if (!cache.has(path)) {
    cache.set(path, (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
          headers: { apikey: SUPABASE_KEY },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        const rows = await res.json();
        // An empty table before the first import would publish an empty site. Keep the snapshot instead.
        if (!rows.length && fallback.length) throw new Error('no published rows yet');
        return rows;
      } catch (e) {
        if (!warned) { console.warn(`[cms] Supabase unreachable, using the snapshot in src/data/cms/ (${(e as Error).message})`); warned = true; }
        return fallback;
      }
    })());
  }
  return cache.get(path)!;
}

const time = (s?: string | null) => (s ? Date.parse(s) : 0);
const pub = 'status=eq.published';

/** Published posts, newest first (undated posts after dated ones, by sort). */
export async function getPosts(category?: string): Promise<Post[]> {
  const rows = await rest<Post>(`posts?${pub}&select=*,category:post_categories(name,slug,sort)`, postsSnap as Post[]);
  return rows
    .filter((p) => !category || p.category?.slug === category.toLowerCase() || p.category?.name === category)
    .sort((a, b) => time(b.published_at) - time(a.published_at) || (a.sort ?? 999) - (b.sort ?? 999));
}

export async function getPostCategories(): Promise<Cat[]> {
  const rows = await rest<Cat>('post_categories?select=name,slug,sort&order=sort', postCatsSnap as Cat[]);
  return [...rows].sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999));
}

/** Published podcast episodes, newest first. */
export async function getEpisodes(): Promise<Episode[]> {
  const rows = await rest<Episode>(`podcast_episodes?${pub}&select=*`, episodesSnap as Episode[]);
  return [...rows].sort((a, b) => time(b.published_at) - time(a.published_at) || (b.number ?? 0) - (a.number ?? 0));
}

/** Published videos in Len's order. */
export async function getVideos(): Promise<Video[]> {
  const rows = await rest<Video>(`videos?${pub}&select=*`, videosSnap as Video[]);
  return [...rows].sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999) || time(b.published_at) - time(a.published_at));
}

/** Published favorites in Len's order. */
export async function getFavorites(): Promise<Favorite[]> {
  const rows = await rest<Favorite>(`favorites?${pub}&select=*,category:favorite_categories(name,slug,sort)`, favoritesSnap as Favorite[]);
  return [...rows].sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999) || a.name.localeCompare(b.name));
}

export async function getFavoriteCategories(): Promise<Cat[]> {
  const rows = await rest<Cat>('favorite_categories?select=name,slug,sort&order=sort', favCatsSnap as Cat[]);
  return [...rows].sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999));
}

export const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';

/** Turn a YouTube / Vimeo watch link into an embeddable player URL. Other URLs pass through. */
export function embedUrl(u?: string | null): string | null {
  if (!u) return null;
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return u;
}

/** How to show a media URL: a player iframe (YouTube, Vimeo, Libsyn player), a direct audio/video file, or a plain link. */
export function mediaKind(u?: string | null): { kind: 'iframe' | 'audio' | 'video' | 'link'; src: string } | null {
  if (!u) return null;
  if (/\.(mp3|m4a|aac|wav|ogg)(\?|$)/i.test(u)) return { kind: 'audio', src: u };
  if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(u)) return { kind: 'video', src: u };
  if (/youtube\.com|youtu\.be|vimeo\.com|\/embed\/|player\./i.test(u)) return { kind: 'iframe', src: embedUrl(u)! };
  return { kind: 'link', src: u };
}
