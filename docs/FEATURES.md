# FEATURES — everything built (storefront + Studio OS)

Condensed from all build sessions. Source of truth = the code; this is the map.

## Storefront — "Editorial Gallery" (dark, gold, serif display)

**Wave 1 — trust & commerce basics**
- MRP strikethrough + % OFF badges on cards and PDP
- Coupons: DIWALI10, FIRST100 (₹100 off ₹999+) — active in DB, applied at checkout
- Reviews render with `--c-star` gold stars; 8 seeded reviews

**Wave 2 — merchandising**
- Deal of the Day with live countdown
- Wall Sets (curated multi-frame bundles)
- Wishlist (localStorage; `/wishlist` page; heart on cards)
- Stock display + low-stock cues on PDP

**Wave 3 — conversion & local SEO**
- 9 hyper-local Raebareli landing pages (`app/*-raebareli/`), each bespoke copy + CTA
- WhatsApp + call floating contact, bulk/office ordering path (`/bulk`)
- FAQ, gallery, services, track-order UX polish
- Reference: `reference-research-wave3.md` (competitor research: frameley, purehomeandliving,
  printshoppy, printo, printitnice — palette + layout anatomy)

**Wave 4 — editorial polish (commit `22b6858`)**
- Homepage: hero proof pill, № indices, display-serif kinetic type, GSAP + Lenis motion,
  editorial utilities (`.bg-elev-*`, `.surface-card`, `.display-xl`, `.press`)
- Custom cursor, preloader, back-to-top, chrome-gate

**Studio OS — owner admin (`/admin`)**
- Desktop: Linear-style sidebar; mobile: glass bottom bar (owner uses phone)
- Tabs: Dashboard (KPIs, low stock), Orders (payment-proof approve/reject + audit log),
  Products (CRUD + images + stock), Promos/Coupons, Settings (**Themes drawer**, shop info,
  content blocks), Bookings, Bulk rates
- Gate: Google OAuth (ajmalnic, vishishthgaurlittle) → `profiles.role` check → `components/admin/` guard
- Security headers; admin never clickjacked (X-Frame-Options SAMEORIGIN)

**Payments** — manual by design: UPI → customer uploads screenshot (`payment_proofs`) → Studio
approval → order progresses. **No Razorpay. No auto-refunds.**

**Accounts** — permanent login (relay cookie fix); 9 profiles. PWA install surfaces owner-only.

## Explicitly NOT built (rejected/deferred)

- Razorpay / any payment gateway
- Courier integration / auto-tracking
- Live-canvas frame customizer ("design your frame" preview tool)
- Light/cream full-site theme variant (researched; owner settled on dark gold)
- Server-side wishlist

## Google / SEO state

- robots.ts + sitemap.ts generated; local-landing pages indexed progressively
- Desired listing name: "Quality Glass Emporium Raebareli" (alt "Quality Glass Raebareli")
- Google shows "Vercel" while on vercel.app subdomain — fix = custom domain (pending)
