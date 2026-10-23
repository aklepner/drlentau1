# Supabase (content for drlentau.com)

Project: `jkjuepbjuxpgodfpcdkn` (https://jkjuepbjuxpgodfpcdkn.supabase.co).
Len edits content at **/admin/** (`public/admin/`). The site reads published rows at build time (`src/lib/cms.ts`).

## Tables

| Table | What it holds | Site pages |
|---|---|---|
| `posts` + `post_categories` | News, articles, blogs (one type with a category; Len can add categories) | /news/, /news/<slug>/ |
| `podcast_episodes` | Raving Patients episodes with show notes and the Libsyn audio link | /podcast/, /podcast/<slug>/, Home "Latest episodes" |
| `videos` | Interviews and presentations (YouTube or Vimeo links) | /videos/, /videos/<slug>/, Resources "Watch" |
| `favorites` + `favorite_categories` | Len's Favorites companies | /favorites/, /favorites/<slug>/ |
| `admin_users` | Emails allowed to edit (no policies: change it in the dashboard Table Editor) | |

Every content table has `status` (`draft` or `published`); the public only sees `published`.
Images Len uploads go to the public Storage bucket `media`.

## Security

- Row Level Security on every table. Anonymous visitors read published rows only.
- Signed-in users can write only if their email is in `admin_users` (`public.is_admin()`).
- The browser and the build use the publishable key only. Never put the secret (service role) key in this repo.

## Accounts (one-time, in the Supabase dashboard)

1. Authentication > Users > Add user > Create new user, for `len@drlentau.com` and `andy@brighteridea.com`, with "Auto Confirm User" on. Share Len's password with him privately, or let him use "Forgot your password?" on /admin/.
2. Authentication > Sign In / Providers > Email: turn **off** "Allow new users to sign up". (Only invited users should exist. Even if someone signs up, they cannot edit: they are not in `admin_users`.)
3. Authentication > URL Configuration: Site URL `https://aklepner.github.io/drlentau1/admin/` (change to `https://drlentau.com/admin/` at launch), and add both to Redirect URLs. This makes the password reset email link back to the admin page.

To add another editor later: create the user (step 1) and insert their email into `admin_users`.

## Automatic publishing

Saving in /admin/ fires a database trigger (`rebuild_site` on each content table) that asks GitHub to run the
"Deploy preview" workflow, so the site updates about two minutes later. It needs a GitHub token stored in Supabase Vault:

1. GitHub > Settings > Developer settings > Fine-grained tokens > Generate new token. Repository access: only `aklepner/drlentau1`. Permissions: **Actions: Read and write**. Pick a long expiry and put a reminder in your calendar.
2. Supabase > SQL Editor, run (paste the token where shown; do not paste it anywhere else):
   `select vault.create_secret('<token>', 'github_rebuild_token');`
   To replace it later: `select vault.update_secret((select id from vault.secrets where name = 'github_rebuild_token'), '<new token>');`

Until the token exists, saves still work and the site picks them up at the daily scheduled build (09:17 UTC) or the next push.
The admin page says which mode is active.

## Build fallback

If Supabase is unreachable during a build, `src/lib/cms.ts` uses the snapshot in `src/data/cms/*.json`
(also used if a table comes back empty, so a mistake can never publish an empty site).
Refresh it with `node scripts/cms-snapshot.mjs` and commit. Set `CMS_OFFLINE=true` to force the snapshot.

## Schema changes

Use migrations (Supabase MCP `apply_migration` or the CLI), never hand edits. Applied so far:
`cms_schema`, `cms_tighten_is_admin`, `enable_pg_net`, `cms_rebuild_trigger`.
When adding a column, also add it to `TYPES` in `public/admin/admin.js` and to the page that shows it.
