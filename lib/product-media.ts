import type { ProductImage } from "@/lib/server/catalog";

/**
 * Every product carries its own image in product_images (set by the owner
 * via Owner Studio). These are only safety nets if a row ever goes missing —
 * all paths below point at files that exist in public/images.
 */
const FALLBACK_IMAGES: Record<string, string> = {};

export function primaryImage(
  slug: string,
  images: ProductImage[] | undefined
): { src: string; alt: string } {
  const first = images?.find((i) => i.url || i.storage_key);
  if (first?.url) return { src: first.url, alt: first.alt ?? slug };
  // storage_key-based sources are wired when the private/public bucket flow lands
  return { src: FALLBACK_IMAGES[slug] ?? "/images/hero-wedding.jpg", alt: slug };
}
