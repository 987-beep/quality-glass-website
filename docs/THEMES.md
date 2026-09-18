# THEMES — the 10-accent system

**State: SETTLED. Default = `gold` (original Luxe Gold).** The owner cycled through
plum → crimson → Santi-maroon and finally asked to **fully restore gold** (commit `f064088`).
Do not surprise-recolor. Pink/plum shades rejected explicitly — never offer unless re-asked.

## How it works (no-flash)

1. `app/layout.tsx` (async) server-reads `site_settings[shop].value.theme` via `getSiteTheme()`
   → `safeTheme()` → stamps `<html data-theme="gold" suppressHydrationWarning>` and mounts
   `<ThemeProvider initial>` → Language → Auth → Cart providers.
2. `app/globals.css` defines `:root { --c-gold: …; --c-gold-light: …; --c-gold-dark: …; --c-gold-deep: …; --c-glow: …; --c-star: … }`
   plus a `[data-theme="…"]` block per accent overriding the same tokens.
3. `tailwind.config.ts` maps `gold.*` utilities to `rgb(var(--c-gold…))` — so swapping data-theme
   recolors the **entire site** (37 pages) with zero component changes.
4. Owner switches live in **Studio → Settings → Themes** (one tap; `settings-admin.tsx` writes the
   same DB key + live preview via `useTheme()`).

## The 10 accents (`lib/theme.ts`, in order)

| id | Name (EN/HI) | Base RGB | Notes |
|---|---|---|---|
| `gold` ⭐default | Luxe Gold / सुनहरा लक्ज़री | 201 162 75 (#C9A24B) | the original launch look |
| `santi-maroon` | Santi Maroon / सांति मैरून | 214 63 63 (#D63F3F dark-tuned) | Santi Sharee combo: #7b1e26/#5c141b deep pairs, teal stars variant |
| `crimson` | Crimson / गहरा लाल | 229 72 77 (#E5484D) | red family (owner-requested) |
| `maroon` | Maroon / मैरून | 212 69 87 (#D44557) | red family |
| `vermilion` | Vermilion / सिंदूरी | 255 90 31 (#FF5A1F) | red family, warmest |
| `emerald` | Emerald / पन्ना | — | original set |
| `rose` | Champagne Rose / गुलाबी | — | original set （香檳, not pink-plum) |
| `sapphire` | Royal Sapphire / नीला | — | original set |
| `platinum` | Platinum / प्लैटिनम | — | original set |
| `amber` | Amber / केसरिया | — | original set |

(Exact tokens for every accent live in `globals.css` `[data-theme]` blocks — trust the file.)

## Rules

- **3 places must agree** when a theme changes: `globals.css` (`:root`/`[data-theme]` block),
  `lib/theme.ts` (union + THEMES + DEFAULT_THEME), and DB `site_settings.shop.value.theme`.
  A previous bug (stale `imperial-plum`) was exactly this 3-way mismatch.
- `imperial-plum` is fully deleted (0 refs repo-wide). Adding/removing themes = edit
  `lib/theme.ts` + add/remove the CSS block. `safeTheme()` falls back to gold on unknown ids.
- `.text-star` utility + `--c-star` token drive rating stars (gold-light by default;
  santi-maroon ships teal stars #14958f as its signature).
- `.gold-frame` physical-moulding gradients are **product imagery, not theme** — intentionally
  hardcoded, never retheme them.
- Light/cream full-site variant (Santi-style "make it light") was researched but NOT built —
  tokens are ink-on-dark across the site; do not attempt a quick `:root` swap for light mode.
