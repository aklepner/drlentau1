// Dev server only: serve frozen review rounds (public/<round>/...) at folder URLs like /first-round/.
// Built sites and GitHub Pages already do this; Astro's dev server does not for files in public/.
import { existsSync, readFileSync } from 'node:fs';

export default function roundsDev() {
  return {
    name: 'dlt-rounds-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const registry = new URL('../public/rounds.json', import.meta.url);
        server.middlewares.use((req, _res, next) => {
          if (!existsSync(registry) || !req.url) return next();
          const { rounds = [] } = JSON.parse(readFileSync(registry, 'utf8'));
          const [path, query = ''] = req.url.split('?');
          const hit = rounds.some((r) => path === `/${r.name}` || path.startsWith(`/${r.name}/`));
          if (hit && !/\.[a-z0-9]+$/i.test(path)) {
            req.url = path.replace(/\/?$/, '/index.html') + (query ? `?${query}` : '');
          }
          next();
        });
      },
    },
  };
}
