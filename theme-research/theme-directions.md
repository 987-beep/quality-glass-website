# Ultra-deep Interface Theme Research — Quality Glass Emporium
_Date: 2026-09-17 · Scope: customer mainpage + Owner Studio admin_

## Sources analyzed (deep)
Internet research (12+ authoritative sources, 2026 current):
- adminlte.io "19 Best Dark Mode Dashboards 2026", Colorlib "21 Dark Admin Templates 2026"
- aydesign.ai "Dark mode dashboard patterns 2026" (Linear/Vercel/Notion/GitHub/Stripe/Supabase studies)
- 925studios "35 SaaS Dashboard patterns 2026" (Stripe single-metric, Linear progressive disclosure…)
- nexitomedia + itsbuzzinteractive "2026 e-commerce design trends" (radical simplicity, bento grids, social-proof-in-design-layer, glassmorphism, kinetic serif)
- Muzli/Awwwards galleries (Arteriors editorial commerce)
Reference stores (live CSS extraction, not screenshots):
- **frameley.com** — decoded from shipped CSS: base white #fff + greys #f2f2f2, PRIMARY PLUM #8e0e6d (52 usages — buttons/links), soft pink tint #f5e5f1, fonts Bookmania (serif display) + Plus Jakarta Sans (body) + Great Vibes (script accents)
- **printo.in** — purple #662d91 + orange #f47920 on white #EFF1F2, slate #39424E text
- printshoppy / printitnice / purehomeandliving — white/light standard commerce
- KEY SIGNAL: **all 5 of Ajmal's references are LIGHT themes. Industry data: light+clean+one-action-per-view = highest commodity-commerce conversion (esp. mobile-first Indian D2C)**

## Our current state
- Dark luxury: ink #0C0A06/#14110A/#1D1810, ivory text #F1EAD9, 6 accent themes via `data-theme` CSS vars, Fraunces+Inter+Noto-Devanagari fonts — variable architecture ✅ (light theme is very feasible as one more data-theme)
- Admin: same dark-gold, 11 top tabs, card grids

────────────────────────────────────────────
## MAINPAGE — 3 directions

### A. "EDITORIAL GALLERY" (elevate current dark) 
Awwwards-luxury. Keep ink+gold; add layered surface elevation (#14110A→#1D1810→#241E13 steps), ~30% more whitespace, bento-grid featured, rating pill inside hero, display type clamp(3rem,8vw,5.5rem), micro-hover physics, serif kinetic reveal.
+ unique vs every competitor | premium brand aura
− dark reads slower outdoors; slightly lower commodity conversion
Effort: 1.5 days (CSS-dominant)

### B. "PAPER COMMERCE" (light, reference-matched) ★ conversion pick
Palette: paper #FAF7F2 · card #FFFFFF · walnut text #2A2118 · brass #8C6A2F (or Frameley plum #8E0E6D) · border #E7DFD3 · sale red #C2402F stays
Fraunces stays for headings (works on light), Inter body, tags uppercase 10px letter-spaced (Printo/Frameley pattern)
Patterns: white product cards w/ soft shadow, single saturated accent, generous whitespace, sticky bottom action bar on mobile product page, ratings-in-hero
+ matches all 5 refs + industry-proof highest conversion | photos pop on white | outdoor readable (Raebareli sun + cheap phones)
− loses dark uniqueness (brass keeps warmth though)
Effort: ~2 days (new data-theme="paper" + component QA)

### C. "IVORY BRIDGE" (hybrid) 
Light paper for commerce pages (shop/product/cart/checkout), ink-dark for home hero + editorial sections (section-scoped surfaces). Best of both; slightly more CSS discipline.

────────────────────────────────────────────
## OWNER STUDIO ADMIN — 2 directions

### 1. "STUDIO OS" (Linear/Vercel/shadcn-style) ★ recommended
- True-grey ramp: base #0F1114 · surface #16191F · elevated #1E232B · borders rgba(255,255,255,.07)
- Borderless elevation cards (Notion pattern), single gold accent in desaturated system (Linear pattern), mono stat numerals, semantic status chips (Stripe pattern)
- LEFT SIDEBAR (icons+labels, collapses to bottom-bar on mobile) replacing 11 top tabs, grouped: Sell (orders/bookings/stock) · Catalog (products/bulk/wholesale) · Customers (users/loyalty/reviews) · Marketing (coupons/banners/deals) · System (settings/analytics)
- Top bar: global search + store-status pill + quick "+" actions
Effort: ~2 days

### 2. "COMMAND CARDS" (mobile-command-center)
Keeps structure, restyles: grouped tab chips, home tile grid = big stat cards with mini-trends, oversized touch rows (his phone is the main admin device).
Effort: ~1 day

────────────────────────────────────────────
## Deliverable pattern for both
Single `data-theme` accent swap already exists — we extend to full surface system so owner can A/B from Studio Settings instantly (paper ↔ ink) with zero deploy.
