# CHANGELOG — condensed history of all build sessions

Full narrative context for any agent picking this up. Newest last.

## 2026-08 — original build
- Full store from scratch: Next.js 14 + InsForge + Tailwind dark-gold "gallery" look
- Owner Studio (6 tabs), manual UPI payment flow, Google OAuth admins,
  local Raebareli SEO pages, security headers, cart/checkout/track
- **Permanent-login fix**: relay (`lib/server/insforge.ts`) hadn't forwarded `cookie` →
  refresh 401'd → 2 h logouts; fixed with `forwardCookie` on the auth surface
- Master handbook written at workspace root (`/home/user/PROJECT-HANDBOOK.md` outside repo)
- Owner-guides + marketing kit in `/home/user/shop-marketing/`

## 2026-09 (early) — Waves 1–4
- Coupons (DIWALI10, FIRST100), reviews, MRP/%OFF everywhere
- Deal of the Day + countdown, Wall Sets, Wishlist (client-side)
- 9 Raebareli landing pages, WhatsApp/call floating contact, bulk path
- **Commit `22b6858`**: Editorial Gallery homepage + Studio OS admin chrome (sidebar/bottom bar)
  + first theme-provider groundwork

## 2026-09-18 — THE THEME SAGA (5 commits, all live-verified)

| Commit | What happened |
|---|---|
| `b2334e0` | **Fix**: ThemeProvider was never mounted → themes looked broken. Made `layout.tsx` async: server-reads DB theme → `<html data-theme>` + mounts provider. Plum theme went live as default. |
| `af31711` | Owner rejected pink/plum ("i dont want pink colour shade") → wanted red shades like competitors. Deleted `imperial-plum` entirely; added **crimson #E5484D / maroon #D44557 / vermilion #FF5A1F** (dark-tuned); default → crimson. Hue analysis of 5 reference sites guided the reds (see External Sources below). |
| `9164317` + `8c52d63` | Owner demanded **Santi Sharee's exact combo, gold removed**. Curled santi-sharee.pages.dev, decoded shipped CSS tokens (`--brand #7b1e26`, `--brand-d #5c141b`, `--star #14958f` teal). Swapped `:root` to maroon family (lifted #D63F3F base + exact deep pairs), added `.text-star` teal star utility, deleted gold from picker, chrome gold leftovers (selection/focus/checkbox) → maroon. |
| `f064088` | **Owner reversed: "fully recover the old theme colour."** Full gold restore: `:root` back to 201 162 75 family, gold re-added to THEMES (first, default), DB theme⇒gold, stars → gold-light, checkbox/selection/focus → #c9a24b. Build 37/37 green; live-verified `data-theme="gold"`. **← current HEAD** |

**Lessons burned in:** theme must be edited in 3 places together (globals.css + lib/theme.ts + DB);
plum/pink banned; gold is settled; `.gold-frame` moulding gradients are not theme tokens.

## External Sources (research that influenced decisions)

- **santi-sharee.pages.dev** decoded palette: brand #7b1e26/#5c141b maroons, **teal stars #14958f**
  (signature), brass #b98a2f, slate ink #282c3f — light-theme site
- **Red-family hue analysis** (python over downloaded competitor dumps): purehomeandliving reds =
  #ff4e00 vermilion (7×), #ec0101, #f44336, #ff5722, #ff6347 + brass #b59677; printo hot-CTA =
  #f47920 orange (48×), no true red; printshoppy = #db4437 + #e7711b; frameley = no red (plum);
  printitnice = indigo #6366f1. Conclusion: successful Indian frame competitors use warm
  red/vermilion action colors — informed the crimson/maroon/vermilion trio.
- Layout anatomy of frameley.com, purehomeandliving.com, printshoppy.com, printo.in compiled in
  `/home/user/theme-research/theme-directions.md` (hero → shape tiles → social proof → FAQ chains).

## Open / pending (as of 2026-09-18)

- Owner asked (latest): **full new interface for mainpage + admin, DEMO FIRST**, after deep research
  of the 5 competitor sites. Demo HTML mockups were being prepared in `/home/user/interface-demos/`
  when the request pivoted to "prepare everything for Antigravity". That design task is still open.
- Custom domain purchase/setup — pending owner.
- Quality-glass ZIP backup (`/home/user/quality-glass-final-project.zip`) is stale vs HEAD f064088.
