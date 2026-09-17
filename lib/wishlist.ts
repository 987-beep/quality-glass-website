"use client";

/** localStorage wishlist — no login required (Santi pattern). */
const KEY = "qge_wishlist_v1";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function inWishlist(slug: string): boolean {
  return getWishlist().includes(slug);
}

export function toggleWishlist(slug: string): string[] {
  const cur = getWishlist();
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("qge-wishlist", { detail: next }));
  } catch {
    /* private mode */
  }
  return next;
}

export function wishlistCount(): number {
  return getWishlist().length;
}
