"use client";

import { useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const RATE_DELAY = 1500; // 1.5 seconds between requests

const CATEGORIES = [
  { slug: "historical-frames", name: { en: "Historical Frames", hi: "ऐतिहासिक फ़्रेम" } },
  { slug: "led-frames", name: { en: "LED Frames", hi: "LED फ़्रेम" } },
  { slug: "led-mirrors", name: { en: "LED Mirrors", hi: "LED मिरर" } },
  { slug: "mirrors-insta", name: { en: "Mirrors with Insta Profiles", hi: "इंस्टा प्रोफ़ाइल मिरर" } },
  { slug: "anime", name: { en: "Anime", hi: "एनिमे" } },
  { slug: "hindu", name: { en: "Hindu", hi: "हिन्दू" } },
  { slug: "islamic", name: { en: "Islamic", hi: "इस्लामी" } },
  { slug: "christian", name: { en: "Christian", hi: "ईसाई" } },
  { slug: "landscapes", name: { en: "Landscapes", hi: "लैंडस्केप" } },
  { slug: "calendars", name: { en: "Calendars", hi: "कैलेंडर" } },
];

type P = { s: string; en: string; hi: string; d: string; p: number; t: string; f?: boolean };
const PRODUCTS: Record<string, P[]> = {
  "historical-frames": [
    { s: "mughal-empire-golden-frame", en: "Mughal Empire Golden Frame", hi: "मुग़ल साम्राज्य गोल्डन फ़्रेम", d: "Ornate Mughal-era design with intricate gold leaf patterns.", p: 1299, t: "gold", f: true },
    { s: "rajput-heritage-frame", en: "Rajput Heritage Frame", hi: "राजपूत विरासत फ़्रेम", d: "Hand-carved Rajasthani motifs with traditional red and gold.", p: 1199, t: "gold" },
    { s: "ancient-temple-carving-frame", en: "Ancient Temple Carving Frame", hi: "प्राचीन मंदिर नक्काशी फ़्रेम", d: "South Indian temple architecture with stone carving patterns.", p: 1399, t: "gold", f: true },
  ],
  "led-frames": [
    { s: "rgb-color-changing-led-frame", en: "RGB Color Changing LED Frame", hi: "RGB कलर चेंजिंग LED फ़्रेम", d: "Remote-controlled RGB LED strip with 16 colors.", p: 1999, t: "black", f: true },
    { s: "music-sync-led-frame", en: "Music Sync LED Frame", hi: "म्यूज़िक सिंक LED फ़्रेम", d: "LED frame that pulses with music beats.", p: 2499, t: "black", f: true },
    { s: "warm-white-led-frame", en: "Warm White LED Frame", hi: "वॉर्म व्हाइट LED फ़्रेम", d: "Elegant warm white LED backlight frame.", p: 1599, t: "gold" },
  ],
  "led-mirrors": [
    { s: "round-vanity-led-mirror", en: "Round Vanity LED Mirror", hi: "राउंड वैनिटी LED मिरर", d: "Hollywood-style round LED with adjustable brightness.", p: 3499, t: "gold", f: true },
    { s: "infinity-mirror-led", en: "Infinity LED Mirror", hi: "इन्फ़िनिटी LED मिरर", d: "LED infinity mirror creating endless tunnel illusion.", p: 4999, t: "black", f: true },
    { s: "full-length-floor-led-mirror", en: "Full Length Floor LED Mirror", hi: "फ़ुल लेंथ फ़्लोर LED मिरर", d: "Standing full-length with perimeter LED strip.", p: 5999, t: "gold" },
  ],
  "mirrors-insta": [
    { s: "instagram-handle-mirror-led", en: "Instagram Handle LED Mirror", hi: "इंस्टाग्राम हैंडल LED मिरर", d: "Custom LED mirror shaped as your IG handle.", p: 3999, t: "black", f: true },
    { s: "reel-ring-light-mirror", en: "Reels Ring Light Mirror", hi: "रील्स रिंग लाइट मिरर", d: "Large mirror with ring light for perfect reels.", p: 4499, t: "black", f: true },
    { s: "hashtag-neon-mirror", en: "Hashtag Neon Mirror", hi: "हैशटैग नियॉन मिरर", d: "Mirror with neon hashtag for photo backdrops.", p: 2499, t: "black" },
  ],
  "anime": [
    { s: "gojo-infinity-void-frame", en: "Gojo Infinity Void Frame", hi: "गोजो इनफ़िनिटी वॉइड फ़्रेम", d: "Gojo Satoru with Infinity Void technique.", p: 949, t: "black", f: true },
    { s: "jinwoo-shadow-monarch-frame", en: "Jin-Woo Shadow Monarch Frame", hi: "जिन-वू शैडो मोनार्क फ़्रेम", d: "Sung Jin-Woo as Shadow Monarch.", p: 999, t: "black", f: true },
    { s: "naruto-rasengan-frame", en: "Naruto Rasengan Frame", hi: "नारुतो रसेंगन फ़्रेम", d: "Naruto with Rasengan energy effect.", p: 899, t: "black" },
  ],
  "hindu": [
    { s: "ganesha-utsav-frame", en: "Ganesha Utsav Frame", hi: "गणेश उत्सव फ़्रेम", d: "Vibrant Ganesha festive colors.", p: 949, t: "gold", f: true },
    { s: "ram-darbar-frame", en: "Ram Darbar Frame", hi: "राम दरबार फ़्रेम", d: "Complete Ram Darbar in royal setting.", p: 1099, t: "gold", f: true },
    { s: "krishna-murli-frame", en: "Krishna Murli Frame", hi: "कृष्ण मुरली फ़्रेम", d: "Krishna playing flute under moonlight.", p: 999, t: "gold" },
  ],
  "islamic": [
    { s: "ayatul-kursi-calligraphy-frame", en: "Ayatul Kursi Calligraphy Frame", hi: "आयतुल कुर्सी सुलेख फ़्रेम", d: "Arabic calligraphy of Ayatul Kursi in gold.", p: 1099, t: "gold", f: true },
    { s: "makkah-kaaba-frame", en: "Makkah Kaaba Frame", hi: "मक्का काबा फ़्रेम", d: "Holy Kaaba at night with golden dome.", p: 1199, t: "gold", f: true },
    { s: "bismillah-frame", en: "Bismillah Frame", hi: "बिस्मिल्लाह फ़्रेम", d: "Bismillah calligraphy with geometric patterns.", p: 949, t: "gold" },
  ],
  "christian": [
    { s: "sacred-heart-jesus-frame", en: "Sacred Heart of Jesus Frame", hi: "पवित्र हृदय यीशु फ़्रेम", d: "Sacred Heart with golden halo.", p: 1049, t: "gold", f: true },
    { s: "last-supper-frame", en: "Last Supper Frame", hi: "लास्ट सपर फ़्रेम", d: "Leonardo's Last Supper premium print.", p: 1299, t: "gold", f: true },
    { s: "virgin-mary-frame", en: "Virgin Mary Frame", hi: "वर्जिन मैरी फ़्रेम", d: "Virgin Mary with blue veil.", p: 999, t: "gold" },
  ],
  "landscapes": [
    { s: "himalayan-sunrise-frame", en: "Himalayan Sunrise Frame", hi: "हिमालय सनराइज़ फ़्रेम", d: "Himalayan peaks golden light.", p: 1199, t: "gold", f: true },
    { s: "taj-mahal-moonlight-frame", en: "Taj Mahal Moonlight Frame", hi: "ताजमहल मूनलाइट फ़्रेम", d: "Taj Mahal under full moon.", p: 1299, t: "gold", f: true },
    { s: "goa-beach-sunset-frame", en: "Goa Beach Sunset Frame", hi: "गोवा बीच सनसेट फ़्रेम", d: "Golden sunset over Goa beach.", p: 999, t: "gold" },
  ],
  "calendars": [
    { s: "premium-wall-calendar-2026", en: "Premium Wall Calendar 2026", hi: "प्रीमियम वॉल कैलेंडर 2026", d: "12-month wall calendar with stunning photos.", p: 499, t: "gold", f: true },
    { s: "photo-calendar-custom", en: "Custom Photo Calendar", hi: "कस्टम फ़ोटो कैलेंडर", d: "Personalized with YOUR photos.", p: 799, t: "gold", f: true },
    { s: "hindu-panchang-calendar", en: "Hindu Panchang Calendar", hi: "हिन्दू पंचांग कैलेंडर", d: "Traditional Panchang with festival dates.", p: 599, t: "gold" },
  ],
};

export default function SeedPage() {
  const [log, setLog] = useState<string[]>(["⏳ Starting seed..."]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const client = getInsforge();
        const msgs: string[] = [];

        // Check if admin
        const { data: userData } = await client.auth.getCurrentUser();
        const user = (userData as { user?: { id: string } })?.user || (userData as { id?: string });
        if (!user?.id) { setError("❌ Not logged in. Go to /login first."); return; }
        msgs.push(`✅ Logged in as user ${user.id.substring(0, 8)}...`);
        setLog([...msgs]);

        // Check admin role
        const { data: profData } = await client.database.from("profiles").select("role").eq("id", user.id);
        const prof = Array.isArray(profData) ? profData[0] as { role?: string } : null;
        if (prof?.role !== "admin") { setError(`❌ Not an admin (role: ${prof?.role || "none"}). Sign in with an admin account.`); return; }
        msgs.push("✅ Admin confirmed");
        setLog([...msgs]);

        // Delete old data
        for (const table of ["product_images", "frame_options", "products", "categories"]) {
          msgs.push(`🗑️ Clearing ${table}...`);
          setLog([...msgs]);
          const { data } = await client.database.from(table).select("id");
          if (data) for (const row of data as { id: string }[]) {
            await client.database.from(table).delete().eq("id", row.id);
            await delay(RATE_DELAY);
          }
          msgs.push(`   Deleted ${(data as unknown[])?.length || 0}`);
          setLog([...msgs]);
        }

        // Insert categories
        msgs.push("📁 Creating categories...");
        setLog([...msgs]);
        const catMap: Record<string, string> = {};
        for (const cat of CATEGORIES) {
          await delay(RATE_DELAY);
          const { data, error } = await client.database.from("categories").insert({
            slug: cat.slug, name: cat.name, is_active: true,
          }).select("id");
          if (error) { setError(`❌ Category ${cat.slug}: ${error.message || JSON.stringify(error)}`); return; }
          if (data?.[0]) catMap[cat.slug] = (data[0] as { id: string }).id;
          msgs.push(`   ✅ ${cat.slug}`);
          setLog([...msgs]);
        }
        msgs.push(`✅ ${Object.keys(catMap).length} categories created`);
        setLog([...msgs]);

        // Insert products
        msgs.push("📦 Creating 30 products...");
        setLog([...msgs]);
        let total = 0;
        for (const [catSlug, items] of Object.entries(PRODUCTS)) {
          const catId = catMap[catSlug];
          if (!catId) continue;
          for (const p of items) {
            await delay(RATE_DELAY);
            const { error } = await client.database.from("products").insert({
              slug: p.s, name: { en: p.en, hi: p.hi }, description: { en: p.d, hi: p.d },
              base_price: p.p, category_id: catId, frame_tone: p.t, is_featured: p.f || false, is_active: true,
            });
            if (error) { setError(`❌ Product ${p.s}: ${error.message || JSON.stringify(error)}`); return; }
            total++;
            msgs.push(`   ✅ ${p.s}`);
            setLog([...msgs]);
          }
        }

        msgs.push(`\n🎉 DONE! ${Object.keys(catMap).length} categories, ${total} products`);
        setLog([...msgs]);
        setDone(true);
      } catch (e: unknown) {
        setError(`❌ ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    run();
  }, []);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-5 py-24">
      <div className="w-full max-w-lg rounded-2xl border border-gold/40 bg-ink-2 p-8">
        <h1 className="font-serif text-2xl text-ivory">🔄 Database Seed</h1>
        <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-ivory/10 bg-ink p-4 text-xs leading-5 text-ivory/60">
          {log.join("\n")}
        </pre>
        {error && <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
        {done && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gold">✅ Seeding complete!</p>
            <a href="/" className="mt-3 inline-block rounded-full bg-gold px-6 py-3 text-xs font-bold uppercase text-ink">
              Go to Homepage
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
