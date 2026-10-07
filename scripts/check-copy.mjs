// Copy guardrail for Dr. Len Tau's voice. Run: npm run check
// Scans site copy (src/data/*.json, src/pages, src/components) for banned words, em/en dashes and emoji.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BANNED = ['leverage', 'game-changer', 'game changer', 'journey', 'passionate', 'transformative', 'cutting-edge', 'cutting edge', 'revolutionary', 'hustle', 'amazing', 'incredible', 'excited to share', 'great connecting', 'practicing dentist', 'still practice'];
const roots = ['src/data', 'src/pages', 'src/components'];
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(json|astro|md)$/.test(f) && files.push(p); });
roots.forEach(walk);

let problems = 0;
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const text = line.toLowerCase();
    const hits = [];
    for (const w of BANNED) if (new RegExp(`\\b${w}\\b`).test(text)) hits.push(`banned word "${w}"`);
    if (/[—–]/.test(line)) hits.push('em/en dash');
    if (/\p{Extended_Pictographic}/u.test(line)) hits.push('emoji');
    hits.forEach((h) => { problems++; console.log(`${f}:${i + 1}  ${h}\n    ${line.trim().slice(0, 140)}`); });
  });
}
console.log(problems ? `\n${problems} copy problem(s). Fix before publishing.` : `Copy check passed (${files.length} files).`);
process.exit(problems ? 1 : 0);
