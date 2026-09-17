# Competitor / Reference Research — Wave 3 planning
_Date: 2026-09-17 · For: Quality Glass Emporium (quality-glass-website.vercel.app)_

## Sites studied
1. santi-sharee.pages.dev — saree shop (Myntra-style patterns)
2. frameley.com — custom photo frames, Bengaluru
3. purehomeandliving.com/collections/photoframes — home decor Shopify
4. printshoppy.com acrylic frames — custom print gifting
5. printo.in/categories/photo-frames — print chain
6. printitnice.com anime frames — WooCommerce niche frames

## Reusable UI/business patterns found (with source)
- MRP strike + % OFF badges on every card — Santi, Frameley, PrintItNice, Printo
- Deal of the Day + live countdown — Santi
- NEW badge on recent products — Santi
- Sort menu: popularity/rating/latest/price asc-desc + per-page selector — PrintItNice, Santi
- Rating + review count on cards — Santi
- Star histogram + Verified Buyer + helpful votes — Santi
- Similar/related products row — Santi, Printo
- Wishlist button — Santi
- Coupon box on product page, COPY buttons (FIRST100, FESTIVE10) — Santi
- Shop by SIZE tiles with price per size (4x6→27x36, ₹356→₹5,774) — Printo
- Shop frames by SHAPE: Portrait/Landscape/Square/Love/Hexagon/Round — PrintShoppy
- "What can you frame?" endless occasion tiles: Wedding/Pet/Baby/Festival/Memory/Travel — Frameley
- CLUSTERS = curated multi-frame wall bundles, 20% OFF combo — Frameley
- PHOTO GALLERY SETS ("tell a story across your wall", from ₹199 each) — PrintShoppy
- Delivery estimate under every card: "📦 Get it in 2–5 Days" — PrintItNice
- Big-number spec strip: 3–8mm thick / 100% UV / 10+ yrs — PrintShoppy
- "Why choose us" trust row: Pan-India delivery, sizes, thin & light, satisfaction — Frameley
- Free-shipping/service top bar — PureHome, Printo
- Google review widget w/ photos, verified ticks, read-more — Frameley, PrintShoppy (58k+)
- Customer submitted photo wall (58+ images) — PrintShoppy
- Stats row: 42 lakh+ customers / 46 lakh+ delivered / 58,085 Google reviews — PrintShoppy
- "Our story, proudly homegrown since 2015" brand story footer — PrintShoppy
- Gift wrap option at checkout — Frameley, PrintItNice
- WhatsApp preview before final dispatch — PrintItNice
- Personalisation: name/date/quote on frame; name in Japanese Katakana; couple caricature — PrintItNice, PrintShoppy (baby-birth, love-story frames)
- Bulk unit pricing shown: "₹943 each for 10 pieces" — Printo
- Material facets: wood / metal / fiber / acrylic; gold/silver finish — PureHome
- FAQ blocks with Show more/less on category+product pages — all
- Track Order link in header — PureHome
- Free gift in cart promo — PrintShoppy

## QGE already has (do NOT rebuild)
Shop + price filter, product pages + reviews, featured hero, testimonials, 12 SEO landing
pages (wedding/god/anime/certificate/gift/office...), cart+checkout (UPI approve), tracking,
/bulk wholesale table, admin 11 tabs (analytics, bookings, stock, wholesale, loyalty...),
security headers + anti-bot, WhatsApp-first tools, invoice PDF, QR cards.

## PROPOSED WAVE 3 — "Conversion pack" (pure UI/DB, no new deps)
1. compare_at_price on products → MRP slash + % OFF badge site-wide
2. Deal of the Day: product + 24h countdown banner (home)
3. NEW badge: created_at within 14 days
4. Sort select on /shop: popular / newest / rating / discount / price asc-desc + count line
5. Rating★(n) on product cards
6. Verified-buyer reviews + star histogram on product page
7. Coupon strip on product page w/ COPY (reuse coupons.amount_off) + FIRST100 auto-seed
8. Similar products row (same category)
9. Size tiles strip "Shop by size": 4x6→12x16 w/ starting price (SEO pages already exist)
10. "Frame anything" occasion marquee → links to existing SEO landing pages
11. Delivery line under price: "📦 Same-day Raebareli · fitting free"
12. Big-number trust strip: 100% real glass · Fitting experts · 10+ yr polish

## PROPOSED WAVE 4 — "Framing-special features"
13. WALL SETS / clusters: bundle products (3/5/7-frame sets) w/ combo discount
14. Name/date/quote text field per order item → prints on frame
15. WhatsApp design-preview promise banner on custom products
16. Gift wrap checkbox at checkout (+₹30)
17. Google-review style wall + customer photo grid (reuse photo reviews)
18. Stats/story strip: "Since [year] · 1000+ frames · 4.8★"
19. Material facet filters in /shop (wood/metal/fiber/acrylic)
20. Track-order shortcut in header nav

_NOT building:_ payment gateway (user declined), shipping/courier integration,
live canvas frame customizer (too heavy; WhatsApp flow already covers it).
