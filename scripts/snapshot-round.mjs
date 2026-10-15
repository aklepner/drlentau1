// Freeze the current site as a review round, e.g. /first-round/, /second-round/.
//
//   node scripts/snapshot-round.mjs second-round
//
// What it does:
//  1. Builds the site as it is now, served from /<name>/ (all links stay inside the round).
//  2. Points the template's vendor files (/assets/: Bootstrap, jQuery, fonts) at the shared copy
//     instead of duplicating 13 MB per round. Those files are never edited, so this is safe.
//  3. Copies the finished pages into public/<name>/. From then on they are plain files: later
//     changes to the site do not touch them. They are not linked anywhere and are marked noindex.
//
// Rounds are listed in public/rounds.json. Never edit files inside a round folder by hand.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: node scripts/snapshot-round.mjs <round-name>   e.g. second-round');
  process.exit(1);
}
const root = resolve(new URL('..', import.meta.url).pathname);
const target = join(root, 'public', name);
if (existsSync(target)) {
  console.error(`public/${name} already exists. Rounds are frozen; pick a new name.`);
  process.exit(1);
}
const registryPath = join(root, 'public', 'rounds.json');
const registry = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : { rounds: [] };
const out = join(root, '.tmp', `round-${name}`);
rmSync(out, { recursive: true, force: true });

console.log(`Building /${name}/ ...`);
execSync(`npx astro build --outDir "${out}"`, {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, SITE_BASE: `/${name}`, PUBLIC_NOINDEX: 'true', SITE_URL: 'https://drlentau.com' },
});

// Drop the vendor copy and earlier rounds from the build output.
rmSync(join(out, 'assets'), { recursive: true, force: true });
for (const r of registry.rounds) rmSync(join(out, r.name), { recursive: true, force: true });
rmSync(join(out, 'rounds.json'), { force: true });

// Point vendor references (and the favicon) at the shared copies.
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
let pages = 0;
for (const f of walk(out).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8');
  const fixed = html.replaceAll(`/${name}/assets/`, '/assets/').replaceAll(`/${name}/favicon.png`, '/favicon.png');
  if (fixed !== html) writeFileSync(f, fixed);
  pages++;
}

mkdirSync(target, { recursive: true });
cpSync(out, target, { recursive: true });
rmSync(out, { recursive: true, force: true });

let commit = '';
try { commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch {}
registry.rounds.push({ name, path: `/${name}/`, created: new Date().toISOString().slice(0, 10), commit });
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(`Saved ${pages} pages to public/${name}/. Open /${name}/ to view it.`);
