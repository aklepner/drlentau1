// Regenerates public/images/placeholders/<slot>.svg from src/data/photos.json.
// Run: node scripts/make-placeholders.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const photos = JSON.parse(readFileSync(new URL('../src/data/photos.json', import.meta.url)));
const out = new URL('../public/images/placeholders/', import.meta.url);
mkdirSync(out, { recursive: true });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
for (const [slot, p] of Object.entries(photos)) {
  if (slot.startsWith('_')) continue;
  const ink = p.dark ? '#ffffff' : '#143b70';
  const fs = Math.max(11, Math.min(22, Math.round(p.w / 28)));
  // wrap brief into lines
  const words = p.brief.split(' '); const lines = []; let line = '';
  const max = Math.max(14, Math.floor(p.w / (fs * 0.62)) - 4);
  for (const w of words) { if ((line + ' ' + w).trim().length > max) { lines.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) lines.push(line.trim());
  const shown = lines.slice(0, Math.max(1, Math.floor((p.h - 80) / (fs * 1.5)) - 2));
  const startY = p.h / 2 - (shown.length * fs * 1.5) / 2 + fs;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${p.w}" height="${p.h}" viewBox="0 0 ${p.w} ${p.h}">
<rect width="100%" height="100%" fill="${p.dark ? 'rgba(255,255,255,0.06)' : '#d9e2ed'}"/>
<rect x="8" y="8" width="${p.w - 16}" height="${p.h - 16}" fill="none" stroke="${ink}" stroke-opacity="${p.dark ? 0.5 : 1}" stroke-width="1" stroke-dasharray="6 6"/>
<text x="50%" y="${startY - fs * 1.8}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="${Math.round(fs * 0.8)}" font-weight="700" letter-spacing="2" fill="${ink}">PHOTO: ${esc(slot.toUpperCase())} · ${p.w}×${p.h}</text>
${shown.map((l, i) => `<text x="50%" y="${startY + i * fs * 1.5}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="${fs}" fill="${ink}">${esc(l)}</text>`).join('\n')}
</svg>`;
  writeFileSync(new URL(`${slot}.svg`, out), svg);
}
console.log('placeholders written');
