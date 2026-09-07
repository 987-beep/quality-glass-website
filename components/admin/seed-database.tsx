"use client";
import { useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

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
    { s: "british-colonial-frame", en: "British Colonial Frame", hi: "ब्रिटिश कोलोनियल फ़्रेम", d: "Victorian-era style with dark walnut finish.", p: 1099, t: "wood" },
    { s: "maratha-warrior-frame", en: "Maratha Warrior Frame", hi: "मराठा योद्धा फ़्रेम", d: "Bold Maratha design with sword motifs.", p: 1149, t: "black" },
    { s: "ancient-temple-carving-frame", en: "Ancient Temple Carving Frame", hi: "प्राचीन मंदिर नक्काशी फ़्रेम", d: "South Indian temple architecture patterns.", p: 1399, t: "gold", f: true },
    { s: "freedom-struggle-tribute-frame", en: "Freedom Struggle Tribute Frame", hi: "स्वतंत्रता संग्राम श्रद्धांजलि फ़्रेम", d: "Patriotic design with tricolor accents.", p: 999, t: "black" },
    { s: "vintage-portrait-frame", en: "Vintage Portrait Frame", hi: "विंटेज पोर्ट्रेट फ़्रेम", d: "Antique-style ornamental frame.", p: 1049, t: "wood" },
    { s: "sikh-guru-heritage-frame", en: "Sikh Guru Heritage Frame", hi: "सिख गुरु विरासत फ़्रेम", d: "Respectful design with Khanda symbol.", p: 1199, t: "gold" },
    { s: "buddhist-zen-frame", en: "Buddhist Zen Frame", hi: "बौद्ध ज़ेन फ़्रेम", d: "Minimalist with lotus motifs.", p: 899, t: "wood" },
    { s: "medieval-royal-crest-frame", en: "Medieval Royal Crest Frame", hi: "मध्ययुगीन रॉयल क्रेस्ट फ़्रेम", d: "European medieval-inspired frame.", p: 1349, t: "black" },
  ],
  "led-frames": [
    { s: "rgb-color-changing-led-frame", en: "RGB Color Changing LED Frame", hi: "RGB कलर चेंजिंग LED फ़्रेम", d: "Remote-controlled RGB with 16 colors.", p: 1999, t: "black", f: true },
    { s: "warm-white-led-frame", en: "Warm White LED Frame", hi: "वॉर्म व्हाइट LED फ़्रेम", d: "Elegant warm white LED backlight.", p: 1599, t: "gold" },
    { s: "neon-glow-led-frame", en: "Neon Glow LED Frame", hi: "नियॉन ग्लो LED फ़्रेम", d: "Vibrant neon-style for modern rooms.", p: 1899, t: "black" },
    { s: "music-sync-led-frame", en: "Music Sync LED Frame", hi: "म्यूज़िक सिंक LED फ़्रेम", d: "Pulses with music beats.", p: 2499, t: "black", f: true },
    { s: "fairy-light-led-frame", en: "Fairy Light LED Frame", hi: "फ़ेयरी लाइट LED फ़्रेम", d: "Starry effect for bedrooms.", p: 1299, t: "gold" },
    { s: "acrylic-glow-led-frame", en: "Acrylic Glow LED Frame", hi: "एक्रिलिक ग्लो LED फ़्रेम", d: "Edge-lit acrylic with laser designs.", p: 1799, t: "black" },
    { s: "smart-app-controlled-led-frame", en: "Smart App Controlled LED Frame", hi: "स्मार्ट ऐप LED फ़्रेम", d: "WiFi-enabled, app controllable.", p: 2999, t: "black" },
    { s: "sunset-lamp-led-frame", en: "Sunset Lamp LED Frame", hi: "सनसेट लैंप LED फ़्रेम", d: "Trending sunset projection.", p: 1499, t: "gold" },
    { s: "dimmable-touch-led-frame", en: "Dimmable Touch LED Frame", hi: "डिमेबल टच LED फ़्रेम", d: "Touch-sensitive dimming.", p: 1699, t: "gold" },
    { s: "mirror-backlit-led-frame", en: "Mirror Backlit LED Frame", hi: "मिरर बैकलिट LED फ़्रेम", d: "Mirror-finish with hidden LED.", p: 2199, t: "black" },
  ],
  "led-mirrors": [
    { s: "round-vanity-led-mirror", en: "Round Vanity LED Mirror", hi: "राउंड वैनिटी LED मिरर", d: "Hollywood-style round LED.", p: 3499, t: "gold", f: true },
    { s: "rectangular-bathroom-led-mirror", en: "Rectangular Bathroom LED Mirror", hi: "आयताकार बाथरूम LED मिरर", d: "IP44 waterproof with anti-fog.", p: 4299, t: "black" },
    { s: "full-length-floor-led-mirror", en: "Full Length Floor LED Mirror", hi: "फ़ुल लेंथ फ़्लोर LED मिरर", d: "Standing full-length with LED.", p: 5999, t: "gold" },
    { s: "infinity-mirror-led", en: "Infinity LED Mirror", hi: "इन्फ़िनिटी LED मिरर", d: "Endless tunnel illusion.", p: 4999, t: "black", f: true },
    { s: "smart-touch-dimming-led-mirror", en: "Smart Touch Dimming LED Mirror", hi: "स्मार्ट टच डिमिंग LED मिरर", d: "Three-color temperature.", p: 3799, t: "gold" },
    { s: "oval-ornate-led-mirror", en: "Oval Ornate LED Mirror", hi: "ओवल ऑरनेट LED मिरर", d: "Classic oval with warm LED.", p: 3299, t: "gold" },
    { s: "frameless-edge-lit-led-mirror", en: "Frameless Edge-Lit LED Mirror", hi: "फ़्रेमलेस LED मिरर", d: "Ultra-modern frameless.", p: 4499, t: "black" },
    { s: "gym-wall-led-mirror", en: "Gym Wall LED Mirror", hi: "जिम वॉल LED मिरर", d: "Large for home gyms.", p: 5499, t: "black" },
    { s: "kids-star-led-mirror", en: "Kids Star LED Mirror", hi: "किड्स स्टार LED मिरर", d: "Star-shaped for kids rooms.", p: 1999, t: "gold" },
    { s: "makeup-vanity-table-led-mirror", en: "Makeup Vanity Table LED Mirror", hi: "मेकअप वैनिटी LED मिरर", d: "12 Hollywood bulbs.", p: 2999, t: "gold" },
  ],
  "mirrors-insta": [
    { s: "instagram-handle-mirror-led", en: "Instagram Handle LED Mirror", hi: "इंस्टाग्राम हैंडल LED मिरर", d: "Custom LED as your IG handle.", p: 3999, t: "black", f: true },
    { s: "hashtag-neon-mirror", en: "Hashtag Neon Mirror", hi: "हैशटैग नियॉन मिरर", d: "Neon hashtag for reels.", p: 2499, t: "black" },
    { s: "photo-frame-wall-mirror-set", en: "Photo Frame Wall Mirror Set", hi: "फ़ोटो फ़्रेम वॉल मिरर सेट", d: "Like Instagram profile grid.", p: 3499, t: "gold" },
    { s: "like-button-mirror", en: "Like Button Mirror", hi: "लाइक बटन मिरर", d: "Heart-shaped IG like button.", p: 1499, t: "gold" },
    { s: "reel-ring-light-mirror", en: "Reels Ring Light Mirror", hi: "रील्स रिंग लाइट मिरर", d: "Ring light for perfect reels.", p: 4499, t: "black", f: true },
    { s: "stories-circle-mirror", en: "Stories Circle Mirror", hi: "स्टोरीज़ सर्कल मिरर", d: "IG stories gradient border.", p: 1999, t: "gold" },
    { s: "profile-picture-mirror", en: "Profile Picture Mirror", hi: "प्रोफ़ाइल पिक्चर मिरर", d: "IG profile frame for selfies.", p: 1799, t: "gold" },
    { s: "aesthetic-mirror-set", en: "Aesthetic Mirror Set", hi: "एस्थेटिक मिरर सेट", d: "5 mirrors for IG-worthy wall.", p: 2999, t: "gold" },
    { s: "trending-audio-mirror", en: "Trending Audio Mirror", hi: "ट्रेंडिंग ऑडियो मिरर", d: "Music note and waveform.", p: 2199, t: "black" },
    { s: "collab-mirror-duo", en: "Collab Mirror Duo", hi: "कोलैब मिरर डुओ", d: "Pair for couple content.", p: 2799, t: "gold" },
  ],
  "anime": [
    { s: "naruto-rasengan-frame", en: "Naruto Rasengan Frame", hi: "नारुतो रसेंगन फ़्रेम", d: "Naruto with Rasengan energy.", p: 899, t: "black" },
    { s: "gojo-infinity-void-frame", en: "Gojo Infinity Void Frame", hi: "गोजो इनफ़िनिटी वॉइड फ़्रेम", d: "Gojo with Infinity Void.", p: 949, t: "black", f: true },
    { s: "luffy-gear-5-frame", en: "Luffy Gear 5 Frame", hi: "लुफ़ी गियर 5 फ़्रेम", d: "Luffy Gear 5 transformation.", p: 949, t: "gold" },
    { s: "tanjiro-hinokami-frame", en: "Tanjiro Hinokami Dance Frame", hi: "तांजिरो हिनोकामी फ़्रेम", d: "Tanjiro Hinokami Kagura.", p: 899, t: "black" },
    { s: "jinwoo-shadow-monarch-frame", en: "Jin-Woo Shadow Monarch Frame", hi: "जिन-वू शैडो मोनार्क फ़्रेम", d: "Sung Jin-Woo Shadow Monarch.", p: 999, t: "black", f: true },
    { s: "goku-ultra-instinct-frame", en: "Goku Ultra Instinct Frame", hi: "गोकू अल्ट्रा इंस्टिंक्ट फ़्रेम", d: "Goku Ultra Instinct.", p: 949, t: "gold" },
    { s: "levi-ackerman-frame", en: "Levi Ackerman Frame", hi: "लेवी एकरमन फ़्रेम", d: "Captain Levi with ODM gear.", p: 899, t: "black" },
    { s: "itachi-sharingan-frame", en: "Itachi Sharingan Frame", hi: "इताची शारिंगन फ़्रेम", d: "Itachi Mangekyo Sharingan.", p: 949, t: "black" },
    { s: "sukuna-king-of-curses-frame", en: "Sukuna King of Curses Frame", hi: "सुकुना किंग ऑफ़ कर्सेज़ फ़्रेम", d: "Ryomen Sukuna four arms.", p: 999, t: "black" },
    { s: "zoro-three-sword-frame", en: "Zoro Three Sword Frame", hi: "ज़ोरो थ्री स्वॉर्ड फ़्रेम", d: "Roronoa Zoro three-sword.", p: 899, t: "gold" },
  ],
  "hindu": [
    { s: "ganesha-utsav-frame", en: "Ganesha Utsav Frame", hi: "गणेश उत्सव फ़्रेम", d: "Vibrant Ganesha festive colors.", p: 949, t: "gold", f: true },
    { s: "krishna-murli-frame", en: "Krishna Murli Frame", hi: "कृष्ण मुरली फ़्रेम", d: "Krishna playing flute.", p: 999, t: "gold" },
    { s: "ram-darbar-frame", en: "Ram Darbar Frame", hi: "राम दरबार फ़्रेम", d: "Complete Ram Darbar.", p: 1099, t: "gold", f: true },
    { s: "shiva-adiyogi-frame", en: "Shiva Adiyogi Frame", hi: "शिव आदियोगी फ़्रेम", d: "Meditating Shiva Himalayas.", p: 999, t: "black" },
    { s: "hanuman-veer-frame", en: "Hanuman Veer Frame", hi: "हनुमान वीर फ़्रेम", d: "Hanuman carrying mountain.", p: 949, t: "gold" },
    { s: "durga-maa-frame", en: "Durga Maa Frame", hi: "दुर्गा माँ फ़्रेम", d: "Goddess Durga with trident.", p: 1049, t: "gold" },
    { s: "lakshmi-ganesh-diwali-frame", en: "Lakshmi Ganesh Diwali Frame", hi: "लक्ष्मी गणेश दिवाली फ़्रेम", d: "Lakshmi Ganesh Diwali.", p: 999, t: "gold" },
    { s: "saraswati-veena-frame", en: "Saraswati Veena Frame", hi: "सरस्वती वीणा फ़्रेम", d: "Saraswati playing Veena.", p: 949, t: "gold" },
    { s: "sai-baba-frame", en: "Sai Baba Frame", hi: "साईं बाबा फ़्रेम", d: "Shirdi Sai Baba portrait.", p: 899, t: "gold" },
    { s: "shivling-nandi-frame", en: "Shivling with Nandi Frame", hi: "शिवलिंग नंदी फ़्रेम", d: "Sacred Shivling Nandi.", p: 999, t: "black" },
  ],
  "islamic": [
    { s: "ayatul-kursi-calligraphy-frame", en: "Ayatul Kursi Calligraphy Frame", hi: "आयतुल कुर्सी सुलेख फ़्रेम", d: "Arabic calligraphy Ayatul Kursi.", p: 1099, t: "gold", f: true },
    { s: "bismillah-frame", en: "Bismillah Frame", hi: "बिस्मिल्लाह फ़्रेम", d: "Bismillah geometric patterns.", p: 949, t: "gold" },
    { s: "makkah-kaaba-frame", en: "Makkah Kaaba Frame", hi: "मक्का काबा फ़्रेम", d: "Holy Kaaba at night.", p: 1199, t: "gold", f: true },
    { s: "madina-masjid-nabawi-frame", en: "Madina Masjid Nabawi Frame", hi: "मदीना मस्जिद नबवी फ़्रेम", d: "Prophet's Mosque green dome.", p: 1199, t: "gold" },
    { s: "asma-ul-husna-frame", en: "Asma ul Husna Frame", hi: "अस्मा उल हुस्ना फ़्रेम", d: "99 Names of Allah.", p: 1299, t: "gold" },
    { s: "lailaha-illallah-frame", en: "La Ilaha Illallah Frame", hi: "ला इलाहा इल्लल्लाह फ़्रेम", d: "Kalima Tayyiba Arabic.", p: 999, t: "gold" },
    { s: "islamic-geometric-art-frame", en: "Islamic Geometric Art Frame", hi: "इस्लामी ज्यामितीय कला फ़्रेम", d: "Islamic geometric blue gold.", p: 1049, t: "black" },
    { s: "muhammad-pbuh-calligraphy-frame", en: "Muhammad (PBUH) Calligraphy Frame", hi: "मुहम्मद (स.अ.) सुलेख फ़्रेम", d: "Hilye-i-Sharif calligraphy.", p: 1099, t: "gold" },
    { s: "quran-surah-frame", en: "Quran Surah Frame", hi: "क़ुरान सूरह फ़्रेम", d: "Surah Al-Fatiha Thuluth.", p: 1049, t: "gold" },
    { s: "dome-mosque-frame", en: "Dome Mosque Frame", hi: "गुंबद मस्जिद फ़्रेम", d: "Mosque dome chandelier.", p: 999, t: "gold" },
  ],
  "christian": [
    { s: "sacred-heart-jesus-frame", en: "Sacred Heart of Jesus Frame", hi: "पवित्र हृदय यीशु फ़्रेम", d: "Sacred Heart golden halo.", p: 1049, t: "gold", f: true },
    { s: "virgin-mary-frame", en: "Virgin Mary Frame", hi: "वर्जिन मैरी फ़्रेम", d: "Virgin Mary blue veil.", p: 999, t: "gold" },
    { s: "last-supper-frame", en: "Last Supper Frame", hi: "लास्ट सपर फ़्रेम", d: "Leonardo's Last Supper.", p: 1299, t: "gold", f: true },
    { s: "good-shepherd-frame", en: "Good Shepherd Frame", hi: "गुड शेफ़र्ड फ़्रेम", d: "Jesus Good Shepherd.", p: 999, t: "gold" },
    { s: "guardian-angel-frame", en: "Guardian Angel Frame", hi: "गार्डियन एंजेल फ़्रेम", d: "Guardian angel children.", p: 949, t: "gold" },
    { s: "cross-crucifix-frame", en: "Cross Crucifix Frame", hi: "क्रूसीफ़िक्स फ़्रेम", d: "Elegant cross filigree.", p: 899, t: "gold" },
    { s: "nativity-scene-frame", en: "Nativity Scene Frame", hi: "नैटिविटी सीन फ़्रेम", d: "Christmas nativity scene.", p: 1049, t: "gold" },
    { s: "praying-hands-frame", en: "Praying Hands Frame", hi: "प्रेइंग हैंड्स फ़्रेम", d: "Classic praying hands.", p: 899, t: "gold" },
    { s: "st-francis-assisi-frame", en: "St. Francis of Assisi Frame", hi: "सेंट फ़्रांसिस फ़्रेम", d: "St. Francis with birds.", p: 949, t: "wood" },
    { s: "holy-bible-verse-frame", en: "Holy Bible Verse Frame", hi: "पवित्र बाइबल वर्स फ़्रेम", d: "John 3:16 calligraphic.", p: 999, t: "gold" },
  ],
  "landscapes": [
    { s: "himalayan-sunrise-frame", en: "Himalayan Sunrise Frame", hi: "हिमालय सनराइज़ फ़्रेम", d: "Himalayan peaks golden light.", p: 1199, t: "gold", f: true },
    { s: "taj-mahal-moonlight-frame", en: "Taj Mahal Moonlight Frame", hi: "ताजमहल मूनलाइट फ़्रेम", d: "Taj Mahal full moon.", p: 1299, t: "gold" },
    { s: "kerala-backwaters-frame", en: "Kerala Backwaters Frame", hi: "केरला बैकवॉटर्स फ़्रेम", d: "Houseboat backwaters sunset.", p: 1099, t: "gold" },
    { s: "rajasthan-desert-frame", en: "Rajasthan Desert Frame", hi: "राजस्थान डेज़र्ट फ़्रेम", d: "Camel caravan Thar Desert.", p: 1099, t: "gold" },
    { s: "goa-beach-sunset-frame", en: "Goa Beach Sunset Frame", hi: "गोवा बीच सनसेट फ़्रेम", d: "Golden Goa beach sunset.", p: 999, t: "gold", f: true },
    { s: "valley-of-flowers-frame", en: "Valley of Flowers Frame", hi: "वैली ऑफ़ फ़्लॉवर्स फ़्रेम", d: "Valley of Flowers bloom.", p: 1199, t: "gold" },
    { s: "ladakh-pangong-lake-frame", en: "Ladakh Pangong Lake Frame", hi: "लद्दाख पैंगोंग लेक फ़्रेम", d: "Pangong Lake mountains.", p: 1299, t: "gold" },
    { s: "varanasi-ghats-frame", en: "Varanasi Ghats Frame", hi: "वाराणसी घाट फ़्रेम", d: "Ganga Aarti Varanasi.", p: 1149, t: "gold" },
    { s: "jog-falls-karnataka-frame", en: "Jog Falls Karnataka Frame", hi: "जोग फ़ॉल्स फ़्रेम", d: "Jog Falls monsoon.", p: 1099, t: "gold" },
    { s: "kashmir-dal-lake-frame", en: "Kashmir Dal Lake Frame", hi: "कश्मीर डल लेक फ़्रेम", d: "Shikara Dal Lake.", p: 1299, t: "gold" },
  ],
  "calendars": [
    { s: "premium-wall-calendar-2026", en: "Premium Wall Calendar 2026", hi: "प्रीमियम वॉल कैलेंडर 2026", d: "12-month landscapes.", p: 499, t: "gold", f: true },
    { s: "desk-calendar-2026", en: "Desk Calendar 2026", hi: "डेस्क कैलेंडर 2026", d: "Standing desk planner.", p: 349, t: "gold" },
    { s: "hindu-panchang-calendar", en: "Hindu Panchang Calendar", hi: "हिन्दू पंचांग कैलेंडर", d: "Traditional Panchang festivals.", p: 599, t: "gold" },
    { s: "islamic-hijri-calendar", en: "Islamic Hijri Calendar", hi: "इस्लामी हिजरी कैलेंडर", d: "Hijri prayer times.", p: 549, t: "gold" },
    { s: "photo-calendar-custom", en: "Custom Photo Calendar", hi: "कस्टम फ़ोटो कैलेंडर", d: "YOUR photos personalized.", p: 799, t: "gold", f: true },
    { s: "motivational-quotes-calendar", en: "Motivational Quotes Calendar", hi: "मोटिवेशनल कोट्स कैलेंडर", d: "Daily motivational quotes.", p: 449, t: "gold" },
    { s: "nature-wildlife-calendar", en: "Nature & Wildlife Calendar", hi: "नेचर वाइल्डलाइफ़ कैलेंडर", d: "Wildlife photography.", p: 499, t: "gold" },
    { s: "bollywood-retro-calendar", en: "Bollywood Retro Calendar", hi: "बॉलीवुड रेट्रो कैलेंडर", d: "Classic Bollywood posters.", p: 549, t: "gold" },
    { s: "office-planner-calendar", en: "Office Planner Calendar", hi: "ऑफ़िस प्लैनर कैलेंडर", d: "Large office wall planner.", p: 699, t: "gold" },
    { s: "spiritual-calendar", en: "Spiritual Calendar", hi: "आध्यात्मिक कैलेंडर", d: "Multi-faith spiritual.", p: 599, t: "gold" },
  ],
};

export default function SeedDatabaseButton() {
  const [seeding, setSeeding] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    if (!confirm("⚠️ This will DELETE all existing categories & products, then create 10 new categories with 100 products. Continue?")) return;
    setSeeding(true);
    setLog([]);
    setDone(false);
    try {
      const client = getInsforge();
      const msgs: string[] = [];

      const delAll = async (table: string) => {
        msgs.push(`🗑️ Deleting ${table}...`);
        setLog([...msgs]);
        const { data } = await client.database.from(table).select("id");
        if (data) for (const row of data as { id: string }[]) {
          await client.database.from(table).delete().eq("id", row.id);
        }
        msgs.push(`   Deleted ${(data as unknown[])?.length || 0} from ${table}`);
        setLog([...msgs]);
      };

      await delAll("product_images");
      await delAll("products");
      await delAll("categories");
      await delAll("frame_options");

      msgs.push("📁 Inserting new categories...");
      setLog([...msgs]);
      const catMap: Record<string, string> = {};
      for (const cat of CATEGORIES) {
        const { data, error } = await client.database.from("categories").insert({
          slug: cat.slug, name: cat.name, is_active: true,
        }).select("id");
        if (error) throw new Error(`Category ${cat.slug}: ${error.message || JSON.stringify(error)}`);
        if (data?.[0]) catMap[cat.slug] = (data[0] as { id: string }).id;
      }
      msgs.push(`   ✅ ${Object.keys(catMap).length} categories`);
      setLog([...msgs]);

      msgs.push("📦 Inserting 100 products...");
      setLog([...msgs]);
      let total = 0, feat = 0;
      for (const [catSlug, items] of Object.entries(PRODUCTS)) {
        const catId = catMap[catSlug];
        if (!catId) { msgs.push(`   ⚠️ Missing: ${catSlug}`); setLog([...msgs]); continue; }
        for (const p of items) {
          const { error } = await client.database.from("products").insert({
            slug: p.s,
            name: { en: p.en, hi: p.hi },
            description: { en: p.d, hi: p.d },
            base_price: p.p,
            category_id: catId,
            frame_tone: p.t,
            is_featured: p.f || false,
            is_active: true,
          });
          if (error) throw new Error(`Product ${p.s}: ${error.message || JSON.stringify(error)}`);
          total++;
          if (p.f) feat++;
        }
        msgs.push(`   ✅ ${catSlug}: ${items.length} products`);
        setLog([...msgs]);
      }

      msgs.push(`\n🎉 DONE! ${Object.keys(catMap).length} categories, ${total} products, ${feat} featured`);
      msgs.push("Refresh the page to see changes.");
      setLog([...msgs]);
      setDone(true);
    } catch (e: unknown) {
      setLog(prev => [...prev, `❌ ${e instanceof Error ? e.message : String(e)}`]);
    }
    setSeeding(false);
  };

  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/[0.06] p-6">
      <h2 className="font-serif text-xl text-ivory">🔄 Seed Database</h2>
      <p className="mt-2 text-xs leading-5 text-ivory/50">
        Replace all categories & products with new set (10 categories × 10 products = 100 products).
      </p>
      <button onClick={handleSeed} disabled={seeding}
        className="mt-4 rounded-full bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light disabled:opacity-50">
        {seeding ? "⏳ Seeding..." : done ? "✅ Done! Refresh page" : "🚀 Run Seed"}
      </button>
      {log.length > 0 && (
        <pre className="mt-4 max-h-60 overflow-auto rounded-lg border border-ivory/10 bg-ink p-3 text-[10px] leading-5 text-ivory/60">
          {log.join("\n")}
        </pre>
      )}
    </div>
  );
}
