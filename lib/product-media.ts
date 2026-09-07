import type { ProductImage } from "@/lib/server/catalog";

/**
 * Every product carries its own image in product_images (set by the owner
 * via Owner Studio). These are safety nets if a row ever goes missing —
 * all paths below point at files that exist in public/images.
 */
const FALLBACK_IMAGES: Record<string, string> = {
  // Historical Frames
  "mughal-empire-golden-frame": "/images/prod-mughal-empire.jpg",
  "rajput-heritage-frame": "/images/prod-rajput-heritage.jpg",
  "british-colonial-frame": "/images/prod-british-colonial.jpg",
  "maratha-warrior-frame": "/images/prod-maratha-warrior.jpg",
  "ancient-temple-carving-frame": "/images/prod-temple-carving.jpg",
  "freedom-struggle-tribute-frame": "/images/prod-freedom-struggle.jpg",
  "vintage-portrait-frame": "/images/prod-vintage-portrait.jpg",
  "sikh-guru-heritage-frame": "/images/prod-sikh-guru.jpg",
  "buddhist-zen-frame": "/images/prod-buddhist-zen.jpg",
  "medieval-royal-crest-frame": "/images/prod-medieval-crest.jpg",
  // LED Frames
  "rgb-color-changing-led-frame": "/images/prod-rgb-led.jpg",
  "warm-white-led-frame": "/images/prod-warm-white-led.jpg",
  "neon-glow-led-frame": "/images/prod-neon-led.jpg",
  "music-sync-led-frame": "/images/prod-music-sync-led.jpg",
  "fairy-light-led-frame": "/images/prod-fairy-led.jpg",
  "acrylic-glow-led-frame": "/images/prod-acrylic-led.jpg",
  "smart-app-controlled-led-frame": "/images/prod-smart-led.jpg",
  "sunset-lamp-led-frame": "/images/prod-sunset-led.jpg",
  "dimmable-touch-led-frame": "/images/prod-dimmable-led.jpg",
  "mirror-backlit-led-frame": "/images/prod-mirror-led.jpg",
  // LED Mirrors
  "round-vanity-led-mirror": "/images/prod-round-vanity.jpg",
  "rectangular-bathroom-led-mirror": "/images/prod-bathroom-led.jpg",
  "full-length-floor-led-mirror": "/images/prod-fulllength-led.jpg",
  "infinity-mirror-led": "/images/prod-infinity-mirror.jpg",
  "smart-touch-dimming-led-mirror": "/images/prod-smart-dimming.jpg",
  "oval-ornate-led-mirror": "/images/prod-oval-ornate.jpg",
  "frameless-edge-lit-led-mirror": "/images/prod-frameless-led.jpg",
  "gym-wall-led-mirror": "/images/prod-gym-mirror.jpg",
  "kids-star-led-mirror": "/images/prod-kids-star.jpg",
  "makeup-vanity-table-led-mirror": "/images/prod-vanity-table.jpg",
  // Mirrors with Insta Profiles
  "instagram-handle-mirror-led": "/images/prod-ig-handle.jpg",
  "hashtag-neon-mirror": "/images/prod-hashtag-neon.jpg",
  "photo-frame-wall-mirror-set": "/images/prod-wall-set.jpg",
  "like-button-mirror": "/images/prod-like-button.jpg",
  "reel-ring-light-mirror": "/images/prod-reel-ring.jpg",
  "stories-circle-mirror": "/images/prod-stories-circle.jpg",
  "profile-picture-mirror": "/images/prod-profile-pic.jpg",
  "aesthetic-mirror-set": "/images/prod-aesthetic-set.jpg",
  "trending-audio-mirror": "/images/prod-trending-audio.jpg",
  "collab-mirror-duo": "/images/prod-collab-duo.jpg",
  // Anime
  "naruto-rasengan-frame": "/images/prod-ani-naruto.jpg",
  "gojo-infinity-void-frame": "/images/prod-ani-gojo.jpg",
  "luffy-gear-5-frame": "/images/prod-ani-luffy.jpg",
  "tanjiro-hinokami-frame": "/images/prod-ani-tanjiro.jpg",
  "jinwoo-shadow-monarch-frame": "/images/prod-ani-jinwoo.jpg",
  "goku-ultra-instinct-frame": "/images/prod-ani-goku.jpg",
  "levi-ackerman-frame": "/images/prod-ani-levi.jpg",
  "itachi-sharingan-frame": "/images/prod-ani-itachi.jpg",
  "sukuna-king-of-curses-frame": "/images/prod-ani-sukuna.jpg",
  "zoro-three-sword-frame": "/images/prod-ani-zoro.jpg",
  // Hindu
  "ganesha-utsav-frame": "/images/prod-gan-utsav.jpg",
  "krishna-murli-frame": "/images/prod-krishna-murli.jpg",
  "ram-darbar-frame": "/images/prod-ram-darbar.jpg",
  "shiva-adiyogi-frame": "/images/prod-shiva-adig.jpg",
  "hanuman-veer-frame": "/images/prod-hanuman-veer.jpg",
  "durga-maa-frame": "/images/prod-durga-maa.jpg",
  "lakshmi-ganesh-diwali-frame": "/images/prod-lakshmi-ganesh.jpg",
  "saraswati-veena-frame": "/images/prod-saraswati.jpg",
  "sai-baba-frame": "/images/prod-sai-baba.jpg",
  "shivling-nandi-frame": "/images/prod-shivling.jpg",
  // Islamic
  "ayatul-kursi-calligraphy-frame": "/images/prod-isl-ayatul.jpg",
  "bismillah-frame": "/images/prod-isl-bismillah.jpg",
  "makkah-kaaba-frame": "/images/prod-isl-makkah.jpg",
  "madina-masjid-nabawi-frame": "/images/prod-isl-madina.jpg",
  "asma-ul-husna-frame": "/images/prod-isl-asmaul.jpg",
  "lailaha-illallah-frame": "/images/prod-isl-lailaha.jpg",
  "islamic-geometric-art-frame": "/images/prod-isl-geometric.jpg",
  "muhammad-pbuh-calligraphy-frame": "/images/prod-isl-muhammad.jpg",
  "quran-surah-frame": "/images/prod-isl-quran.jpg",
  "dome-mosque-frame": "/images/prod-isl-dome.jpg",
  // Christian
  "sacred-heart-jesus-frame": "/images/prod-chr-sacred.jpg",
  "virgin-mary-frame": "/images/prod-chr-mary.jpg",
  "last-supper-frame": "/images/prod-chr-supper.jpg",
  "good-shepherd-frame": "/images/prod-chr-shepherd.jpg",
  "guardian-angel-frame": "/images/prod-chr-angel.jpg",
  "cross-crucifix-frame": "/images/prod-chr-cross.jpg",
  "nativity-scene-frame": "/images/prod-chr-nativity.jpg",
  "praying-hands-frame": "/images/prod-chr-praying.jpg",
  "st-francis-assisi-frame": "/images/prod-chr-francis.jpg",
  "holy-bible-verse-frame": "/images/prod-chr-bible.jpg",
  // Landscapes
  "himalayan-sunrise-frame": "/images/prod-land-himalaya.jpg",
  "taj-mahal-moonlight-frame": "/images/prod-land-tajmahal.jpg",
  "kerala-backwaters-frame": "/images/prod-land-kerala.jpg",
  "rajasthan-desert-frame": "/images/prod-land-rajasthan.jpg",
  "goa-beach-sunset-frame": "/images/prod-land-goa.jpg",
  "valley-of-flowers-frame": "/images/prod-land-valley.jpg",
  "ladakh-pangong-lake-frame": "/images/prod-land-ladakh.jpg",
  "varanasi-ghats-frame": "/images/prod-land-varanasi.jpg",
  "jog-falls-karnataka-frame": "/images/prod-land-jog.jpg",
  "kashmir-dal-lake-frame": "/images/prod-land-kashmir.jpg",
  // Calendars
  "premium-wall-calendar-2026": "/images/prod-cal-wall.jpg",
  "desk-calendar-2026": "/images/prod-cal-desk.jpg",
  "hindu-panchang-calendar": "/images/prod-cal-panchang.jpg",
  "islamic-hijri-calendar": "/images/prod-cal-hijri.jpg",
  "photo-calendar-custom": "/images/prod-cal-custom.jpg",
  "motivational-quotes-calendar": "/images/prod-cal-motivational.jpg",
  "nature-wildlife-calendar": "/images/prod-cal-nature.jpg",
  "bollywood-retro-calendar": "/images/prod-cal-bollywood.jpg",
  "office-planner-calendar": "/images/prod-cal-office.jpg",
  "spiritual-calendar": "/images/prod-cal-spiritual.jpg",
};

export function primaryImage(
  slug: string,
  images: ProductImage[] | undefined
): { src: string; alt: string } {
  const first = images?.find((i) => i.url || i.storage_key);
  if (first?.url) return { src: first.url, alt: first.alt ?? slug };
  return { src: FALLBACK_IMAGES[slug] ?? "/images/hero-wedding.jpg", alt: slug };
}
