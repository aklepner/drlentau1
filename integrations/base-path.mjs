// Build-time helper for hosting under a sub-folder (GitHub Pages: /drlentau1/).
// Our components and data write root-relative URLs ("/meet/", "/images/x.jpg").
// When SITE_BASE is set, this rewrites them in the built HTML so they include the base.
// Local dev (no SITE_BASE) is untouched. Absolute URLs (https://...) and "//" are left alone.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export default function basePath() {
  return {
    name: 'dlt-base-path',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const base = (process.env.SITE_BASE || '').replace(/\/+$/, '');
        if (!base) return;
        const root = fileURLToPath(dir);
        const fix = (u) => (u.startsWith(base + '/') || u === base ? u : base + u);
        let files = 0;
        const walk = async (d) => {
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith('.html')) {
              const html = await readFile(p, 'utf8');
              const out = html
                // href="/x", src="/x", poster="/x", action="/x"
                .replace(/\b(href|src|poster|action)=(["'])(\/(?!\/)[^"']*)\2/g, (_, a, q, u) => `${a}=${q}${fix(u)}${q}`)
                // url('/x') in inline styles
                .replace(/url\((["']?)(\/(?!\/)[^)"']*)\1\)/g, (_, q, u) => `url(${q}${fix(u)}${q})`)
                // <meta http-equiv="refresh" content="0;url=/x"> on redirect pages
                .replace(/(content=["'][^"']*url=)(\/(?!\/)[^"']*)/g, (_, pre, u) => pre + fix(u));
              if (out !== html) { await writeFile(p, out); files++; }
            }
          }
        };
        await walk(root);
        logger.info(`prefixed root-relative URLs with ${base} in ${files} pages`);
      },
    },
  };
}
