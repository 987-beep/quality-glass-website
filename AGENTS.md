# AGENTS.md — Quality Glass Emporium (READ THIS FIRST)

> Entry point for any AI coding agent (Antigravity, Cursor, Copilot, Arena, Claude Code, etc.)
> working in this repository. Follow the **RULES** below exactly — previous agents produced
> regressions by ignoring them.

---

## 1. WHAT THIS IS

**Quality Glass Emporium** — a live production e-commerce website for a glass + photo-frame
shop in Raebareli, Uttar Pradesh, India ("Quality Glass Emporium Raebareli").

- **Live site:** https://quality-glass-website.vercel.app
- **GitHub repo (PUBLIC):** https://github.com/987-beep/quality-glass-website
- **Hosting:** Vercel Hobby, auto-deploys ~90 s after every push to `main` — **the push IS the deploy**
- **Backend / DB:** InsForge (managed Postgres 15 + auth + storage + REST relay)
- **Admin panel:** `/admin` ("Owner Studio") — Studio OS design, gate-protected
- **Owner:** Ajmal (store owner, non-developer). Google listing name: *Quality Glass Emporium Raebareli*.
- **Google search listing:** primary "Quality Glass Emporium Raebareli", alt "Quality Glass Raebareli".

## 2. STACK

| Layer | Tech |
|---|---|
| Framework | Next.js **14.2.35** (App Router), React 18.3, TypeScript 5.9 |
| Styling | Tailwind CSS 3.4 + custom CSS vars (10-theme system, see `docs/THEMES.md`) |
| Animation | GSAP 3.12, Lenis 1.1 (smooth scroll) — loaded on homepage |
| Backend | InsForge SDK 1.5.2 (`@insforge/sdk`) via server relay `lib/server/insforge.ts` |
| Direct DB | `pg` 8.23 with `INSFORGE_DATABASE_URL` (admin scripts / server reads) |
| Packages | `pdf-lib` (invoice PDFs) |
| Fonts | Google fonts via next/font (editorial serif + clean sans) |

## 3. GETTING RUNNING (local / Antigravity)

```bash
npm i                       # install
cp .env.local.example .env.local   # then paste the 3 values (see below)
npm run dev                 # → http://localhost:3000  (binds 0.0.0.0:3000)
npm run build               # sane-typing build; eslint ignored during builds (by design)
```

**The 3 env vars (server-side only, NEVER prefixed NEXT_PUBLIC_):**
- `INSFORGE_URL` — InsForge project URL
- `INSFORGE_API_KEY` — starts with `ik_`
- `INSFORGE_DATABASE_URL` — postgres://… (direct PG; includes sslmode)

Owner copies these from **Vercel → Project Settings → Environment Variables** (they are already
set there for Production/Preview/Development) or from the InsForge dashboard. Production deploys
do NOT need a local `.env.local`.

## 4. THE THREE CONNECTIONS (current status)

| Connection | How it works | Status |
|---|---|---|
| **GitHub** | `origin` → repo above. Push with a **PAT in the URL** (see DEPLOYMENT.md). Vercel watches `main`. | Repo healthy; sandbox loses `.git/config` so remote may need re-adding: `git remote add origin https://github.com/987-beep/quality-glass-website.git` |
| **Vercel** | Git-integration auto-deploy on push to `main`. Build: `next build`, Node 20, install `npm i`. No Vercel CLI needed. | Working; every verified change appears ~90 s after push |
| **InsForge** | All runtime data via SDK relay (`lib/server/insforge.ts`, cookie-forwarding fix for permanent login). Direct PG for one-off scripts with `INSFORGE_DATABASE_URL`. | Verified live: PG 15.18 reachable, `site_settings shop.theme = "gold"` |

## 5. RULES — DO NOT VIOLATE

1. **Never commit secrets**: `.env.local`, `ik_` keys, `ghp_` tokens, DB passwords. `.env.local` is gitignored — keep it that way.
2. **Deploy = push to `main`** only. Ask the owner for a fresh GitHub PAT **only at the very end** when ready to push; never at the start.
3. **Direct DB writes** (via `pg`) must happen inside a **maintenance flag window**: insert `('maintenance','true')` into `ops.maintenance_flag` before, delete after. (Live site reads this flag; brief maintenance screen.) Read-only queries don't need it.
4. **Theme = gold is settled.** The 10-accent system is switchable via Studio → Settings → Themes (DB key `site_settings[shop].value.theme`). Never hard-store a theme that isn't in `lib/theme.ts` (`safeTheme` guards fall back to default).
5. **No Razorpay / auto-payment.** Payments are manual: customer uploads screenshot → owner approves in Studio → order unlocks. Do not add payment gateways unless owner explicitly asks.
6. **PWA / install surfaces are owner-only** — never show install prompts to customers.
7. **Login is effectively permanent** (cookie-refresh relay fix in `lib/server/insforge.ts`). Do not add session expiry. Admin Google accounts: ajmalnic + vishishthgaurlittle.
8. **India-first context**: ₹ prices, UPI, Hindi/English copy support (LanguageProvider), Raebareli local SEO pages. Keep mobile-first (most traffic is phones).
9. Build must finish with `✓ Generating` (37/37 pages) before pushing. `npm i` first if `node_modules` is missing (sandboxes wipe it).
10. The repo has NO test suite — verify by building + curling the live site after deploy (`grep "data-theme"`).

## 6. WHERE THINGS LIVE

Detailed docs in `docs/`:

- `docs/ARCHITECTURE.md` — app tree, providers, data flow, admin gate
- `docs/DATABASE.md` — every table (live inventory), storage buckets, maintenance flag
- `docs/DEPLOYMENT.md` — GitHub/Vercel/InsForge connection playbook, push procedure
- `docs/THEMES.md` — the 10-theme system, tokens, all files involved
- `docs/FEATURES.md` — everything built (storefront waves 1–4 + Studio OS admin)
- `docs/CHANGELOG.md` — condensed history of all build sessions (what changed & why)
- `OWNER-GUIDE.md` — non-technical owner instructions (Hindi-friendly)
- `reference-research-wave3.md` — competitor research dump (frameley/purehome/printshoppy/printo/printitnice)

## 7. GOLDEN PATH FOR ANY CHANGE

1. Edit code → 2. `npm run build` green → 3. commit (`git -c user.name="Ajmal" -c user.email="987-beep@users.noreply.github.com" commit …`) →
4. get token from owner → push → 5. sleep ~90 s → 6. `curl` the live URL and grep for the change →
7. tell owner to hard-refresh. **No other deploy steps exist.**
