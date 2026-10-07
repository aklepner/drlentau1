# drlentau.com: working agreement for Claude

This is Dr. Len Tau's personal-brand website. Andy Klepner (Brighter Idea Marketing) builds it with Claude.
Andy gives direction in plain language ("swap the hero headline", "add an FAQ to Contact"); Claude makes the change,
verifies it, and reports back briefly. Read this whole file before changing anything.

## Stack

- **Astro 7** static site. `npm run dev` (local preview at http://localhost:4321), `npm run build` (outputs `dist/`), `npm run check` (copy guardrail).
- Node 22.12+.
- Visual base: the purchased **Brevon** HTML template (Gramentheme). Its CSS/JS/images live untouched in `public/assets/`.
- Brand layer: `public/brand/tau-theme.css` re-skins Brevon to the **Dr. Len Tau design system** (navy, square, uppercase headings).
- Supabase will be added later (see "Supabase plan").

## Where things live

```
CLAUDE.md                     this file
src/data/                     ALL page copy and settings (edit these for content changes)
  site.json                   name, nav (with "More" dropdown), footer, links, socials, contact info
  home.json                   homepage, one key per section, top to bottom
  meet.json speaking.json consulting.json books.json podcast.json
  favorites.json reviews.json resources.json contact.json   one file per inner page
  photos.json                 every photo slot (see "Photos")
src/content/news/             News + articles, one Markdown file per post (schema in src/content.config.ts)
src/pages/                    one file per URL; each is a short list of sections
src/components/sections/      one component per section type (ported from Brevon markup)
src/components/site/          Header, Footer, Button, SectionTitle, PageHeader
src/layouts/BaseLayout.astro  <head>, CSS/JS loading, header/footer, anchor-scroll fix
src/lib/photo.ts              resolves a photo slot to a real image or its placeholder
public/assets/                Brevon vendor files. NEVER EDIT.
public/brand/                 logos + tau-theme.css (all visual overrides go here)
public/images/                real photos go here; placeholders/ is generated
template/                     the original 19 Brevon pages. Reference library only, not built.
docs/section-catalog.md       every Brevon section, by page and line, and which are ported
scripts/check-copy.mjs        banned words / em dash / emoji check
scripts/make-placeholders.mjs regenerates placeholder SVGs from photos.json
```

## Golden rules

1. **Content changes go in `src/data/*.json`**, not in components. Components stay generic.
2. **Visual changes go in `public/brand/tau-theme.css`.** Never edit `public/assets/` (vendor files; edits get lost on template updates and break the theme layer's assumptions).
3. **Keep Brevon's class names** when porting markup. `public/assets/js/main.js` finds sliders, accordions, counters and animations by class (`brand-slider`, `feature-box-slider`, `testimonial-slider-content`, `accordion-box`, `count`, `tz-itm-anim`, `text-anim`, `wow`, `des-portfolio-panel`, etc.).
4. **Never invent facts, testimonials, reviews, episode titles or stats.** If a section needs content we do not have, leave its data empty (components that support it render nothing) and add it to "Open items" below.
5. **Verify every change**: `npm run check` then `npm run build` must both pass. For visual changes, look at the page at desktop (1440) and phone (390) widths before reporting done.
6. Andy reviews before anything goes live. Do not deploy, push or change DNS without being asked.
7. Don't commit. Andy commits after he reviews, unless he asks Claude to.
8. **Never run `npm install` or `npm run build` inside Andy's repo from a Linux shell** (cloud workspace or the Cowork VM). It installs Linux-only native packages that break `npm run dev` on his Mac. `node_modules/` and `package-lock.json` belong to the Mac: Andy runs `npm install` there. To test a build, copy the source to your own workspace and build it there.

## Brand rules (Dr. Len Tau design system)

Source: Andy's "Dr. Len Tau" design system artifact (tokens mirrored at the top of `tau-theme.css`).

- **Color:** `navy #143b70` carries everything (headings, buttons, dark bands). Ground is white, with `tau-paper #f3f2ee`, `tau-stone #eeefea`, `tau-mist #d9e2ed` as quiet fills. Body text `ink #333333`. No accent hue, no gradients, no shadows.
- **Type:** Proxima Nova via Len's Adobe Fonts kit; **Montserrat** (Google Fonts) stands in until the kit ID is added to `BaseLayout.astro`. Headings are UPPERCASE (CSS does this; write copy in sentence case). Body 15/26.
- **Shape:** square everywhere (`border-radius: 0` is enforced globally in the theme).
- **Buttons:** `<Button>` component = design system TauButton. Variants: `solid` (default), `outline`, `mist` (the one big hero CTA), `on-navy` (inside navy bands). One solid button per section. No icons in buttons.
- **Link hover on navy:** text links on navy backgrounds (header at top, footer, navy bands and cards) turn orange `#F48723` on hover, set by `--link-hover-on-navy` in `tau-theme.css`. Andy's call (Oct 2026), an approved exception to "no accent hue". Links on light backgrounds keep navy hovers; buttons keep their own hover styles.
- **Icons:** Len's brand has no icon system. Use numbers (01, 02) or text, not icons.
- **Logos:** `public/brand/tau-logo-color.png` on light grounds, `tau-logo-white.png` on navy, `tau-mark-color.png` for favicons/avatars. Never recolor or stretch.
- **Supercharge crossover:** this is the Dr. Len Tau brand. Supercharge (orange, rounded, Barlow) may appear only as a promo inside one navy band. Never use Supercharge orange or its logo on navy here.
- **Photography:** real photos of Dr. Tau only, never stock dentists.
- **Homepage hero (Andy's direction, Oct 2026):** navy-dominant. Building photo (`hero-bg` slot) under a navy overlay, white copy, Dr. Tau's transparent cutout (`hero` slot, `/images/dr-len-tau-hero-cutout.png`, `cutout: true`) standing on the bottom edge. Set `cutout: false` for a framed photo and it centers with equal space above and below (the earlier framed portrait is still in `/images/dr-len-tau-hero.jpg`). No floating cards over the photo (Andy removed them). This is an approved exception to "no gradients": the overlay and blue glow are navy gradients. To make the building show more or less, change the alpha values in the `linear-gradient(90deg, ...)` line under "Hero" in `tau-theme.css`.

## Voice rules (Dr. Len Tau)

Full reference: the `dlt-client-skill` skill. The non-negotiables for site copy:

- A dentist talking to dentists. First person ("I", "my practice"), speaking to "you", "your practice". Calm, direct, collegial. Never hype.
- Short sentences, one idea each. Paragraphs of one to three sentences.
- **No em dashes. No emoji.** Banned: leverage, game-changer, journey, passionate, transformative, cutting-edge, revolutionary, hustle, amazing, incredible. (`npm run check` enforces these.)
- Words to favor: system, visibility, trust, credibility, reviews, listings, social proof.
- **Dr. Tau is no longer a practicing dentist** (confirmed by Andy, Oct 2026). Never say "practicing dentist" or imply he still sees patients. Older sources (the dlt-client-skill, the design system README) still say "practicing"; they are out of date on this point.
- Approved proof points, always in the past tense as the practice he built: 4.9 stars; 1,600+ reviews; 40+ new patients a month; roughly 85% case acceptance. Plus "The Reviews Doctor".
- Taglines: "Be Seen, Be Trusted, Be Chosen." and "Reviews are the difference between a thriving practice and a shrinking practice."
- Books by exact title: *Raving Patients Supercharged* (second edition of *Raving Patients*, 2026), *100+ Tips for Getting Five-Star Reviews*, *Practice Playbook*. The Books page shows these three. Podcast: Raving Patients Podcast (season 9, nearly 350 episodes, new every Friday).
- Never mention Birdeye pricing or contract terms. Never mix Birdeye sales content with Supercharge content in one section.
- Use "ideal client", never "audience" or "target audience", when writing about who Len serves.

## Page map

| URL | Page file | Content |
|---|---|---|
| / | src/pages/index.astro | home.json |
| /meet/ | meet.astro | meet.json |
| /speaking/ | speaking.astro | speaking.json |
| /consulting/ | consulting.astro | consulting.json |
| /books/ | books.astro | books.json |
| /podcast/ | podcast.astro | podcast.json |
| /favorites/ and /favorites/<slug>/ | favorites/index.astro, favorites/[slug].astro | favorites.json |
| /reviews/ (Raving Fans) | reviews.astro | reviews.json |
| /news/ and /news/<slug>/ | news/index.astro, news/[slug].astro | src/content/news/*.md |
| /resources/ | resources.astro | resources.json |
| /contact/ | contact.astro | contact.json |

Redirects for old URLs live in `astro.config.mjs` (`/about`→`/meet`, `/connect`→`/contact`, `/helpful-articles` and `/latest-news`→`/news`). Keep the live site's slugs where they exist.

Content sources (Oct 2026): copied from the live drlentau.com pages and the Aug 27, 2026 "Meet Andy & Len" call (Fireflies). Testimonials, episodes, companies, articles and resource links are real. Book descriptions and the two News posts are mock copy for Len to review.

## Recipes

### Change copy
Edit the matching key in `src/data/<page>.json`. `|` in a title forces a line break. Run `npm run check`.

### Swap in a real photo
1. Put the file in `public/images/` (web-optimized JPG/WebP, roughly the slot's size).
2. In `src/data/photos.json`, set that slot's `src` to `/images/<file>` and fix `alt`.
The slot's `brief` says what shot belongs there; `docs/photo-shotlist.md` lists them all for Len's team.

### Add, remove or reorder a section on a page
Edit the page in `src/pages/`. Each page is a list of `<Section data={...} />` lines; move, delete or add lines. Add the data under a new key in that page's JSON.

### Add a section type from the template
1. Find it in `docs/section-catalog.md` (page + line number) and open that file in `template/`.
2. Copy its markup into a new `src/components/sections/<Name>.astro`. Keep every class name. Replace text and repeated items with props (`data`), images with `photo('<slot>')` (add the slot to `photos.json`, then run `node scripts/make-placeholders.mjs`).
3. Remove things the brand does not use: icon images, `star.svg` kickers, `theme-btn` (use `<Button>`), decorative template images.
4. If it looks off-brand, add rules to `tau-theme.css` under a new commented heading. Never edit `public/assets/css/main.css`.
5. Mark it ported in `docs/section-catalog.md`.

### Add a page
Create `src/pages/<slug>.astro` using `BaseLayout` + `PageHeader` + sections, with copy in `src/data/<slug>.json`. Add it to `site.json` nav/footer if it should be linked.

### Podcast episodes
Full list: `podcast.json > episodes.episodes` (newest first). Homepage teaser: `home.json > episodes.items` (latest three). Use real episodes only. Planned: read the podcast RSS feed at build time so both update automatically (discussed on the Aug 27 call).

### Add a news post or book update
Create `src/content/news/<slug>.md` with frontmatter `title`, `category: News` (or `Article`), `date: YYYY-MM-DD`, `excerpt`, then the body in Markdown. It appears on /news/ and gets its own page at /news/<slug>/.

### Add or change a Favorite company
Edit `favorites.json > companies`. Fields: `slug`, `name`, `category`, `description`, `website` (partner/affiliate URL), `featured`. Each company gets /favorites/<slug>/ automatically. Favorites is a revenue driver for Len: never drop companies without asking.

## Supabase plan (not built yet)

When Andy is ready:
1. `npm i @supabase/supabase-js` and an adapter for the host (`@astrojs/netlify`, `@astrojs/vercel` or `@astrojs/node`); add it in `astro.config.mjs`. Keep `output: 'static'`; opt individual routes into the server with `export const prerender = false`.
2. Env vars in `.env` (gitignored): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service key to the browser. Commit a `.env.example` with names only.
3. First use: the contact form. Create `src/pages/api/contact.ts` (prerender = false) that validates and inserts into a `contact_messages` table with RLS on. Set `contact.json > form.action` to `/api/contact`.
4. Use migrations for schema changes; never change production tables by hand.

## Open items (update as they close)

- [ ] Real photos for every slot in `photos.json` (see `docs/photo-shotlist.md`).
- [ ] Adobe Fonts kit ID for Proxima Nova (currently Montserrat).
- [ ] Buy links for all three books → `books.json > items[].buttons` (empty buttons are hidden).
- [ ] Book descriptions and the two News posts are mock copy: Len to review. Practice Playbook needs real subtitle and description.
- [ ] Book covers load from Len's HighLevel media library (assets.cdn.filesafe.space). Fine for launch; download and self-host later if preferred.
- [ ] Consulting package prices ($4,000 / $7,500 / $12,000) are copied from the live site: confirm still current.
- [ ] Partner/affiliate URLs for every Favorite (`favorites.json > website`), currently empty.
- [ ] Practice Assessment URL (Books + Resources show "Coming soon").
- [ ] Migrate the 21 helpful articles, the /videos/ pages and the podcast episode pages off the old site before cutover; links point there today.
- [ ] Speaker reel video and Meet Len intro video IDs (`speaking.json > reel.youtube`, `meet.json > video.vimeo`).
- [ ] Speaker packet PDF is from 2019; replace with a current one.
- [ ] Old "The Reputable Dentist" eBook link may be dead.
- [ ] Confirm current podcast sponsors (CloudDentistry, DocSites, Dental Intel).
- [ ] Contact form backend (Supabase or GHL). The form does not submit anywhere yet.
- [ ] Public email/phone for the footer and contact page, if Len wants them shown.
- [ ] Real testimonials (with permission) for the quote slider, or keep Len's own quotes.
- [ ] Privacy and Terms pages (footer links point to /privacy/ and /terms/, which do not exist yet).
- [ ] Hosting choice (Netlify, Vercel, or other) and domain cutover plan.
- [ ] Confirm Birdeye GM title should appear in the credential strip.
