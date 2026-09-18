# ARCHITECTURE — Quality Glass Emporium

Next.js 14 App Router, single production deployment on Vercel, InsForge as the entire backend
(Postgres + auth + storage behind a cookie-forwarding server relay).

## Request / data flow

```
BROWSER ──(https)──▶ NEXT.JS on VERCEL ──(SDK relay / direct PG)──▶ INSFORGE
   │                      │                                          │
   │  ISR/SSR pages       │  app/api/* (health, reviews, track)      │  Postgres 15.18
   │  client providers    │  lib/server/insforge.ts (cookie fix)     │  auth.users (Google OAuth)
   │  cart/wishlist LS    │  pg Client for server reads              │  storage buckets (proofs, product imgs)
```

## app/ tree (all routes)

Public customer pages:
`/` (home — Editorial Gallery), `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/track`,
`/gallery`, `/services`, `/bulk`, `/wishlist`, `/contact`, `/about`, `/faq`, `/login`, `/signup`, `/account`

Local-SEO landing pages (Raebareli targeting):
`photo-framing-…`, `custom-frames-…`, `wedding-album-framing-…`, `god-frame-mandir-…`,
`certificate-framing-…`, `anime-poster-framing-…`, `glass-mirror-work-…`, `office-bulk-frames-…`

System:
`app/layout.tsx` — **async root layout**: server-calls `getSiteTheme()` → stamps
`<html data-theme={safeTheme} suppressHydrationWarning>` and mounts
`ThemeProvider → LanguageProvider → AuthProvider → CartProvider`. This is THE no-flash theme path.
`app/globals.css` — `:root` gold tokens + `[data-theme="…"]` overrides + editorial utilities.
`api/health`, `api/reviews`, `api/track` — thin API routes; everything else flows through the SDK relay.
`robots.ts`, `sitemap.ts` — generated SEO files. (Google shows "Vercel" as site name while on
the vercel.app subdomain; resolves only with a custom domain.)

Admin:
`/admin` — Studio OS chrome (desktop sidebar + mobile bottom bar), gate-protected (see below).
`/studio` — alias surface. Tabs: Dashboard, Orders (+ payment-proof approval), Products, Settings
(incl. Themes drawer), Promos/Coupons, more.

## components/

- `admin/` — every Studio tab (`*-admin.tsx`), gate, status chips, proof viewer
- `providers/` — `theme-provider.tsx` (mounted in layout!), `language`, `auth`, `cart`
- `navbar.tsx`, `footer.tsx`, `floating-contact.tsx` (WhatsApp/call), `install-prompt.tsx` (owner-only)
- `fx/` — GSAP/Lenis effects; `gallery/`; `contact/`; `auth/`; `custom-cursor.tsx`, `preloader.tsx`, `back-to-top.tsx`, `chrome-gate.tsx`

## lib/

- `theme.ts` — `THEMES` (10 accents), `ThemeId` union, `DEFAULT_THEME='gold'`, `safeTheme()`
- `server/insforge.ts` — **relay with `forwardCookie` on the auth surface** (permanent-login fix:
  without cookie forwarding, refresh tokens 401'd → logout every ~2 h)
- server data helpers (`getSiteTheme()` etc.), `site-settings`, products, orders…
- `scripts/` — one-off DB diagnostics (need `pg` + `INSFORGE_DATABASE_URL`)

## Key architectural decisions (don't relitigate)

1. **Theme applied on the server** (layout.tsx reads DB theme before render) — client-only theme
   application caused flash/invisible-accent bugs earlier. Never move this back client-side.
2. **Manual payment flow**, no gateway: checkout → customer pays via UPI → uploads screenshot →
   `payment_proofs` row → Studio approval unlocks the order.
3. **Cart & wishlist are client-side** (localStorage / context); orders hit DB only at checkout.
4. **Admin gate**: route-guard checks profile role ∈ {owner, admin} — verify in `components/admin/`
   before touching `/admin`; Google OAuth accounts are provisioned in DB (`profiles`).
5. Security headers in `next.config.mjs` (X-Frame-Options SAMEORIGIN etc.) — the `/admin` surface
   must keep them.
