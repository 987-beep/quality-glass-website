import type { ProductImage } from "@/lib/server/catalog";

/**
 * Fallback images for products — serves static files from public/images/.
 * Owner uploads real photos via admin panel to replace these.
 */
const FALLBACK_IMAGES: Record<string, string> = {
  // Historical Frames (3)
  "mughal-empire-golden-frame": "/images/prod-hist-mughal.jpg",
  "rajput-heritage-frame": "/images/prod-hist-rajput.jpg",
  "ancient-temple-carving-frame": "/images/prod-hist-temple.jpg",
  // LED Frames (3)
  "rgb-color-changing-led-frame": "/images/prod-led-rgb.jpg",
  "music-sync-led-frame": "/images/prod-led-music.jpg",
  "warm-white-led-frame": "/images/prod-led-warm.jpg",
  // LED Mirrors (3)
  "round-vanity-led-mirror": "/images/prod-mirror-vanity.jpg",
  "infinity-mirror-led": "/images/prod-mirror-infinity.jpg",
  "full-length-floor-led-mirror": "/images/prod-mirror-floor.jpg",
  // Mirrors with Insta Profiles (3)
  "instagram-handle-mirror-led": "/images/prod-insta-handle.jpg",
  "reel-ring-light-mirror": "/images/prod-insta-ring.jpg",
  "hashtag-neon-mirror": "/images/prod-insta-hashtag.jpg",
  // Anime (3)
  "gojo-infinity-void-frame": "/images/prod-anime-gojo.jpg",
  "jinwoo-shadow-monarch-frame": "/images/prod-anime-jinwoo.jpg",
  "naruto-rasengan-frame": "/images/prod-anime-naruto.jpg",
  // Hindu (3)
  "ganesha-utsav-frame": "/images/prod-hindu-ganesha.jpg",
  "ram-darbar-frame": "/images/prod-hindu-ram.jpg",
  "krishna-murli-frame": "/images/prod-hindu-krishna.jpg",
  // Islamic (3)
  "ayatul-kursi-calligraphy-frame": "/images/prod-islamic-ayatul.jpg",
  "makkah-kaaba-frame": "/images/prod-islamic-kaaba.jpg",
  "bismillah-frame": "/images/prod-islamic-bismillah.jpg",
  // Christian (3)
  "sacred-heart-jesus-frame": "/images/prod-christian-sacred.jpg",
  "last-supper-frame": "/images/prod-christian-supper.jpg",
  "virgin-mary-frame": "/images/prod-christian-mary.jpg",
  // Landscapes (3)
  "himalayan-sunrise-frame": "/images/prod-land-himalaya.jpg",
  "taj-mahal-moonlight-frame": "/images/prod-land-taj.jpg",
  "goa-beach-sunset-frame": "/images/prod-land-goa.jpg",
  // Calendars (3)
  "premium-wall-calendar-2026": "/images/prod-cal-wall.jpg",
  "photo-calendar-custom": "/images/prod-cal-custom.jpg",
  "hindu-panchang-calendar": "/images/prod-cal-panchang.jpg",
};

export function primaryImage(
  slug: string,
  images: ProductImage[] | undefined
): { src: string; alt: string } {
  const first = images?.find((i) => i.url || i.storage_key);
  if (first?.url) return { src: first.url, alt: first.alt ?? slug };
  return { src: FALLBACK_IMAGES[slug] ?? "/images/cat-historical.jpg", alt: slug };
}
