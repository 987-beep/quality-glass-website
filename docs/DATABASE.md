# DATABASE — live inventory (verified 2026-09-18)

Engine: **PostgreSQL 15.18** (InsForge managed). Two access paths:
- **Runtime** — `@insforge/sdk` via `lib/server/insforge.ts` (respects auth/RLS, cookie-forwarded)
- **Scripts** — direct `pg` with `INSFORGE_DATABASE_URL` (see maintenance rule below)

## public.* tables + live row counts

| Table | Rows | Purpose |
|---|---|---|
| `products` | 32 | catalog (frames, wall sets, deal-of-day flags via fields) |
| `product_images` | — | extra gallery images per product |
| `categories` | — | shop categories |
| `orders` | 4 | customer orders (status lifecycle, `order_items` children) |
| `order_items` | — | line items w/ snapshot of price/variant |
| `payment_proofs` | 3 | manual UPI screenshots awaiting/after approval |
| `profiles` | 9 | extends auth.users; `role` ∈ customer/owner/admin gates Studio |
| `coupons` | 2 | **DIWALI10**, **FIRST100** (₹100 off ₹999+) — both active |
| `reviews` | 8 | product reviews (stars render gold `--c-star`) |
| `site_settings` | 2 | key `shop` holds JSON incl. `value.theme` (currently `"gold"`) |
| `promos` | — | marketing promos/strips |
| `content_blocks` | — | editable copy blocks |
| `bulk_rates` | — | wholesale/photos bulk pricing |
| `frame_options` | — | moulding/size/mat options for custom orders |
| `stock_items` + `stock_log` | — | inventory with audit trail |
| `bookings` | — | shop visit bookings |
| `audit_logs` | — | Studio action audit trail |

No `wishlist_items` table — wishlist lives client-side (localStorage). **Do not create server
wishlist tables** without explicit owner request.

## auth.* (InsForge)
`users`, `user_providers` (Google OAuth linked), `config`, `oauth_configs`, `custom_oauth_configs`, `email_otps`
Admin Google accounts provisioned: **ajmalnic**, **vishishthgaurlittle** (both admin role).

## storage.*
Buckets + objects hold product images and payment-proof uploads. Manage via SDK, not hand SQL.

## ⛔ Direct-PG write rule (maintenance flag)

Any script that **writes** via direct `pg` connection MUST:

```js
await c.query(`insert into ops.maintenance_flag(key,value) values('maintenance','true')`);
// …do writes…
await c.query(`delete from ops.maintenance_flag where key='maintenance'`);
```

The live storefront checks this flag and shows a brief maintenance screen — protects customers
from half-applied writes. Read-only queries need no flag. (Wrap in try/catch: if the `ops`
schema is absent in a fresh clone, skip silently.)

## Settings shape

`site_settings where key='shop'` → JSON. Live example keys: `theme`, `shop_name`, contact, hours…
**Theme must always be one of the 10 ids in `lib/theme.ts`** (guarded by `safeTheme()`; unknown
values fall back to `gold`).
