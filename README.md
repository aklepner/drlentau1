# drlentau.com

Dr. Len Tau's website. Astro 7, built on the Brevon template and re-skinned to the Dr. Len Tau design system.

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # voice guardrail: banned words, em dashes, emoji
npm run build    # static site in dist/
```

- Copy lives in `src/data/*.json`. Photos are slots in `src/data/photos.json`.
- Brand styling lives in `public/brand/tau-theme.css`. The template's own files in `public/assets/` are never edited.
- `template/` holds the original Brevon pages as a reference library.
- How we work on this with Claude: see `CLAUDE.md`.
