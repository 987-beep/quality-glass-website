# 📖 Quality Glass Emporium — Owner's Complete Working Guide

*Har option ki poori jaankari — aapki website kaam kaise karti hai aur aapko kya karna hai.*

**Your website:** https://quality-glass-website.vercel.app
**Owner Studio (admin):** https://quality-glass-website.vercel.app/admin
**Login:** `owneajmal69@qualityglass.in` + your password · *(Sirf owner/admin ko admin dikhta hai)*

---

## 🗺️ PART 1 — What Your Website Has (Public Side)

| Page | URL | What customers do here |
|---|---|---|
| Home | `/` | Hero photos, categories, featured frames, reviews, contact + map |
| Shop | `/shop` | Browse all 49 products, filter by category |
| Product page | `/product/...` | See photos, star rating, pick size/frame/glass, add to cart |
| Cart & Checkout | `/cart` → `/checkout` | Enter details, apply offer code, pay by UPI QR, upload payment screenshot |
| Track order | `/track` | Enter order no + phone → see live status (no login needed). You can also send them a direct link |
| Bulk orders | `/bulk` | Weddings/events enquiry form → WhatsApp, then optional ₹200 advance |
| Account | `/account` | Login, see their orders, upload/re-upload payment proof |
| Login/Signup | `/login` `/signup` | Email+password, Google, or email OTP |

---

## 🏪 PART 2 — Owner Studio (`/admin`) — Every Tab Explained

Sign in → open `/admin`. Tabs at top: **Overview · Orders & Payments · Products · Promos & Offers · Reviews · Settings**. Top-right: **Accounts** button (customer accounts) and **Sign out**.

### 📊 Tab 1: Overview

Your daily snapshot. Auto-refreshes when you open it.

- **Pending payment proofs** — screenshots waiting for your approval (target: 0)
- **Orders today** — new orders since midnight
- **Active products** — products visible in shop
- **Revenue collected (₹)** — total of *paid* orders only (cancelled/rejected/pending do NOT count)
- **Latest orders** — 5 newest orders; tap any row to jump into it
- **Quick guide** — the 3-step payment flow reminder

> ⚠️ Revenue ₹0 dikhe toh tension nahi — that means no *paid* orders yet. Sirf test/cancelled orders count nahi hote.

---

### 📦 Tab 2: Orders & Payments — *yahi aapka roz ka kaam hai*

**Top filter chips:** Needs action (gold badge = kitne pending hain) · Active · All orders · Closed

**🔎 Walk-in jump box** *(new)* — customer aaye aur apna order dikhaye? Paste their order number (`QG-XXXXXX`) or their full track link → press **Jump ▸** → seedha us order pe pahunch jaoge.

**Every order row shows:** order number · status chip · customer name · amount · date.

**⭐ One-tap chips** *(new)* — har row ke neeche gold button, bina order khole next step:
`Approve payment ✓` → `Start production →` → `Ready for pickup` / `Out for delivery` → `Mark completed ✓`
*(Approve payment dabate hi unka screenshot bhi approve ho jata hai — double kaam nahi.)*

**Row kholne par (tap the row):**
- **Items** — exactly what they ordered, with size/frame options and custom photo note
- **🏷️ Coupon tag** *(new)* — if they used an offer code, you see which code + how much they saved
- **Customer details** — name, phone, delivery address / pickup
- **Payment proof** — "View screenshot" → screenshot opens; check amount + UTR
- **Actions** — Approve ✓ / Reject payment / Cancel order (with reason note)
- **WhatsApp button** — one tap sends the customer a warm status message **with their personal track link** *(new — ab customer "कब तैयार है?" nahi puchega, khud track karega)*

**Payment flow (3 steps):**
1. Customer pays UPI + uploads screenshot → order becomes gold **"Verifying payment"**
2. You check screenshot → **Approve ✓** (work starts) or **Reject** (they re-upload)
3. Move forward: production → pickup/delivery → completed. Customer sees every step on their track link.

---

### 🖼️ Tab 3: Products

49 products ki poori control.

- **Search** by name/slug · **+ New product** button
- **Each row:** photo · name · slug · price · frame tone · badges:
  - `hidden` — shop me nahi dikh raha (is_active off)
  - **📷 n/2 photos** *(new — gold)* — less than 2 photos! Featured grid + hero wall photo-driven hain, toh photos zaroor daalo
- **Counter top-right:** "n need photos" — kitne products pe photos kami hai
- **☆ Feature / ★ Featured** — gold = homepage Featured grid + hero wall me dikhega
- **Active toggle** — green = shop me live, red = hidden
- **Edit / Delete** — price, names (EN+HI), description, category, photos change/remove

**Photo tips:** 2–4 photos per product best. First photo = sab jagah main photo (grid, hero, cards).

---

### 🎉 Tab 4: Promos & Offers

Do cheezein — **banners** + **offer codes** *(new)*:

**A) Banner promotions** — homepage pe dikhne wale offer banners (image + text + link). Add/edit/reorder/on-off. Live hote hi site pe show.

**B) Offer codes · ऑफर कोड** *(new)* — festival sales ke liye:
- **Add code:** type code (e.g. `DIWALI10`), % off (1–90), optional minimum order ₹, optional expiry date → **Add code**
- **● Live / ○ Off** — one tap on/off without deleting
- Customer checkout pe code type karega → instant % discount + purana price cut ke dikhta hai → kam amount ka UPI QR
- Orders tab me aapko milega 🏷️ tag: kaunsa code use hua, kitna save kiya
- Code share karo WhatsApp status pe — **active codes checkout ko dikhte hain** (yahi design hai, taaki checkout validate kar sake), isliye secret codes mat banana

> 💡 Example: Diwali pe `DIWALI10` (10% off) — abhi seeded hai, Promos tab me use karke dekho.

---

### ⭐ Tab 5: Reviews

Customer photo-reviews (they submit from their track page after order completes).

- **Pending (gold)** — waiting for your nod; **Approve ✓** → website pe live; **Hide** → wapas hide; **Delete** → spam hatao
- Sirf **approved** reviews homepage + product pages pe dikhte hain
- **Product pages pe ★ rating** *(new)* — jaise hi reviews approve karoge, har product page pe average stars automatically aa jayenge. Zyada good reviews approve karo = zyada trust = zyada sales

---

### ⚙️ Tab 6: Settings

- **UPI details** — payment VPA (`8957288848@fam`), payee name, QR image. **Yeh sab jagah use hota hai:** checkout QR, bulk advance button
- **Site content blocks** — homepage texts (carefully edit)
- Changes save karte hi live — koi publish button nahi

---

### 👥 Accounts button (top-right gold pill) → `/admin/users`

Customer accounts manager:
- Sab accounts list — name, email, phone, kab bane
- **Reset/delete** options for problem accounts
- ⚠️ Real accounts (aapke 4) kabhi delete mat karna

---

### 🧾 Other admin pages

| Page | What it does |
|---|---|
| `/admin/qr-card` | Print-ready QR cards for your shop counter (site QR + JustDial review QR) — print karke counter pe rakho |
| `/admin/invoice/[id]` | Order ka printable invoice (order kholke print button) |

---

## 🔔 PART 3 — Roz ka 5-minute routine

1. `/admin` kholo → **pending proofs** dekho (0 ho toh sab theek)
2. Orders tab → **Needs action** chip → screenshots approve/reject
3. **One-tap chips** se orders aage badhao (production → ready → done)
4. **WhatsApp buttons** se customers ko update bhejo (track link automatically judta hai)
5. Products tab → **📷 badges** dekho, photos complete karo

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| Button/change nahi dikh raha | **Hard-refresh: Ctrl+Shift+R** (phone: Chrome → menu → refresh), phir logout→login |
| FORBIDDEN / error aaya | Logout → fresh login karo, dobara try. Phir bhi ho toh message ka screenshot developer ko |
| Revenue ₹0 | Normal hai — sirf PAID orders count hote hain |
| Coupon kaam nahi kar raha | Promos tab me check karo: ● Live hai? Expiry date nikal gayi? Min order ₹ se kam ka order? |
| Customer "payment uploaded but order nahi dikh raha" | Orders → All orders me order no se jump box use karo |

---

*Guide version: Wave-2 (Aug 2026) — covers all 7 new features: track links, offer codes, ₹200 advance, one-tap chips, photo badges, contact map, product stars.*
