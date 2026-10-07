import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * News and articles. One Markdown file per post in src/content/news/.
 * category: "News" (book updates, announcements) or "Article" (helpful articles).
 * external: set for articles still hosted on the old site; the card links there instead of /news/<slug>/.
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['News', 'Article']),
    date: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    external: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { news };
