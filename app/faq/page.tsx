"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";
import RevealText from "@/components/fx/reveal-text";

interface FAQItem {
  q: { en: string; hi: string };
  a: { en: string; hi: string };
}

const categories: { icon: string; label: { en: string; hi: string }; items: FAQItem[] }[] = [
  {
    icon: "🖼️",
    label: { en: "Products", hi: "प्रोडक्ट" },
    items: [
      { q: { en: "What frame sizes do you offer?", hi: "आप कौन से फ़्रेम साइज़ देते हैं?" }, a: { en: "We offer all standard sizes (8×10, 12×16, 16×20, etc.) plus fully custom sizes. Just tell us your photo dimensions.", hi: "हम सभी स्टैंडर्ड साइज़ (8×10, 12×16, 16×20, आदि) और कस्टम साइज़ देते हैं। बस अपनी फोटो का साइज़ बताएँ।" } },
      { q: { en: "What frame materials are available?", hi: "कौन से फ़्रेम मटेरियल उपलब्ध हैं?" }, a: { en: "Gold (metallic), wood (natural walnut), and black (modern matte). Each has a unique look — we'll help you pick.", hi: "गोल्ड (मेटैलिक), वुड (नेचुरल वॉलनट), और ब्लैक (मॉडर्न मैट)। हर एक का अलग लुक है — हम मदद करेंगे।" } },
      { q: { en: "Do you do LED mirrors?", hi: "क्या आप LED मिरर बनाते हैं?" }, a: { en: "Yes! We make round vanity mirrors, infinity mirrors, full-length floor mirrors, and custom Instagram handle mirrors — all with LED.", hi: "हाँ! हम राउंड वैनिटी, इन्फ़िनिटी, फ़ुल लेंथ और कस्टम Instagram हैंडल मिरर बनाते हैं — सब LED के साथ।" } },
      { q: { en: "Can I get a custom frame with my own photo?", hi: "क्या मैं अपनी फोटो के साथ कस्टम फ़्रेम बनवा सकता हूँ?" }, a: { en: "Absolutely! Send us your photo on WhatsApp, choose the frame style and size, and we'll print and frame it for you.", hi: "बिल्कुल! WhatsApp पर फोटो भेजें, फ़्रेम स्टाइल और साइज़ चुनें — हम प्रिंट और फ़्रेम कर देंगे।" } },
    ],
  },
  {
    icon: "🚚",
    label: { en: "Shipping", hi: "डिलीवरी" },
    items: [
      { q: { en: "Do you deliver?", hi: "क्या आप डिलीवरी करते हैं?" }, a: { en: "Yes, we deliver anywhere in Raebareli city. Free delivery on orders above ₹500. Pickup from shop is always free.", hi: "हाँ, रायबरेली शहर में कहीं भी डिलीवरी। ₹500+ पर फ्री डिलीवरी। दुकान से पिकअप हमेशा फ्री।" } },
      { q: { en: "How long does it take?", hi: "कितना समय लगता है?" }, a: { en: "Ready-made frames: same day or next day. Custom frames: 2-5 days depending on complexity.", hi: "रेडी-मेड फ़्रेम: उसी दिन या अगले दिन। कस्टम फ़्रेम: 2-5 दिन, काम की जटिलता पर निर्भर।" } },
      { q: { en: "Do you ship outside Raebareli?", hi: "क्या आप रायबरेली के बाहर भेजते हैं?" }, a: { en: "Currently we serve Raebareli city only. For bulk orders outside the city, please contact us on WhatsApp.", hi: "अभी हम सिर्फ़ रायबरेली शहर में सेवा देते हैं। शहर के बाहर बल्क ऑर्डर के लिए WhatsApp पर संपर्क करें।" } },
    ],
  },
  {
    icon: "↩️",
    label: { en: "Returns", hi: "रिटर्न" },
    items: [
      { q: { en: "What is your return policy?", hi: "रिटर्न पॉलिसी क्या है?" }, a: { en: "We accept returns within 7 days for manufacturing defects. Custom-made frames with customer photos cannot be returned.", hi: "मैन्युफैक्चरिंग डिफेक्ट पर 7 दिन में रिटर्न। कस्टमर फोटो वाले कस्टम फ़्रेम रिटर्न नहीं होंगे।" } },
      { q: { en: "What if the frame is damaged during delivery?", hi: "डिलीवरी में फ़्रेम खराब हो जाए तो?" }, a: { en: "We'll replace it free of cost. Just send us a photo of the damage on WhatsApp within 24 hours.", hi: "हम मुफ़्त में बदल देंगे। 24 घंटे में WhatsApp पर नुकसान की फोटो भेजें।" } },
    ],
  },
  {
    icon: "💳",
    label: { en: "Payments", hi: "पेमेंट" },
    items: [
      { q: { en: "What payment methods do you accept?", hi: "कौन से पेमेंट तरीक़े स्वीकार हैं?" }, a: { en: "UPI (GPay, PhonePe, Paytm), cash on pickup, and online payment through our website.", hi: "UPI (GPay, PhonePe, Paytm), पिकअप पर कैश, और हमारी वेबसाइट से ऑनलाइन पेमेंट।" } },
      { q: { en: "Do I need to pay full amount upfront?", hi: "क्या पूरा पैसा पहले देना होगा?" }, a: { en: "For custom orders, we take 50% advance. Ready-made frames can be paid fully at pickup.", hi: "कस्टम ऑर्डर पर 50% एडवांस। रेडी-मेड फ़्रेम का पूरा पैसा पिकअप पर।" } },
    ],
  },
  {
    icon: "🔧",
    label: { en: "Services", hi: "सेवाएँ" },
    items: [
      { q: { en: "Do you restore old photos?", hi: "क्या आप पुरानी फोटो रीस्टोर करते हैं?" }, a: { en: "Yes! We can restore faded, torn, or damaged photos and then frame them beautifully.", hi: "हाँ! हम फीकी, फटी या खराब फोटो रीस्टोर करके खूबसूरती से फ़्रेम करते हैं।" } },
      { q: { en: "Can you cut glass to custom sizes?", hi: "क्या आप कस्टम साइज़ में काँच काटते हैं?" }, a: { en: "Yes, we do custom glass cutting for windows, shelves, tabletops, and any other purpose.", hi: "हाँ, हम खिड़की, शेल्फ़, टेबलटॉप और किसी भी उद्देश्य के लिए कस्टम काँच काटते हैं।" } },
      { q: { en: "Do you make wedding albums?", hi: "क्या आप शादी एल्बम बनाते हैं?" }, a: { en: "Yes, we create premium wedding albums with custom covers, and also frame individual wedding photos.", hi: "हाँ, हम कस्टम कवर के साथ प्रीमियम शादी एल्बम बनाते हैं, और शादी की फोटो भी फ़्रेम करते हैं।" } },
    ],
  },
];

export default function FAQPage() {
  const { lang } = useLanguage();
  const [activeCat, setActiveCat] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredItems = categories[activeCat].items.filter((item) => {
    if (!search) return true;
    const q = (item.q[lang] || item.q.en).toLowerCase();
    const a = (item.a[lang] || item.a.en).toLowerCase();
    return q.includes(search.toLowerCase()) || a.includes(search.toLowerCase());
  });

  return (
    <main className="relative min-h-[100svh] pb-24 pt-28 md:pt-36">
      <div className="relative mx-auto max-w-[900px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
          {lang === "hi" ? "सहायता" : "Help Center"}
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ivory md:text-7xl">
          <RevealText text={lang === "hi" ? "अक्सर पूछे" : "Frequently"} className="block" />
          <em className="italic text-gold-light">
            <RevealText text={lang === "hi" ? "जाने वाले सवाल" : "Asked Questions"} className="block" delay={0.15} />
          </em>
        </h1>

        {/* Search */}
        <div className="mt-8">
          <input
            type="text"
            placeholder={lang === "hi" ? "सवाल खोजें..." : "Search questions..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-ivory/15 bg-white/[0.04] px-5 py-3.5 text-sm text-ivory placeholder-ivory/30 outline-none transition-all duration-300 focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat.label.en}
              onClick={() => { setActiveCat(i); setOpenIndex(null); setSearch(""); }}
              className={`rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
                activeCat === i
                  ? "border-gold bg-gold text-ink"
                  : "border-ivory/15 text-ivory/60 hover:border-gold/40 hover:text-ivory"
              }`}
            >
              {cat.icon} {cat.label[lang] || cat.label.en}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="mt-8 space-y-3">
          {filteredItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                  isOpen ? "border-gold/30 bg-white/[0.04]" : "border-ivory/10 bg-white/[0.02]"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-ivory">{item.q[lang] || item.q.en}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 shrink-0 text-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                  style={{ overflow: "hidden" }}
                >
                  <p className="px-5 pb-4 text-sm leading-6 text-ivory/55">
                    {item.a[lang] || item.a.en}
                  </p>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <p className="rounded-xl border border-dashed border-gold/30 bg-gold/[0.05] p-8 text-center text-sm text-ivory/50">
              {lang === "hi" ? "कोई सवाल नहीं मिला। WhatsApp पर पूछें!" : "No questions found. Ask us on WhatsApp!"}
            </p>
          )}
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-12 rounded-2xl border border-gold/20 bg-gradient-to-br from-ink-2 via-ink to-ink-2 p-8 text-center">
          <p className="font-serif text-2xl text-ivory">
            {lang === "hi" ? "अभी भी सवाल है?" : "Still have questions?"}
          </p>
          <p className="mt-2 text-sm text-ivory/50">
            {lang === "hi" ? "WhatsApp पर पूछें — हम मिनटों में जवाब देते हैं" : "Ask us on WhatsApp — we reply within minutes"}
          </p>
          <a
            href={SHOP.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
          >
            {lang === "hi" ? "WhatsApp पर पूछें" : "Ask on WhatsApp"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
          </a>
        </div>
      </div>
    </main>
  );
}
