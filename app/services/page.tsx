import type { Metadata } from "next";
import Link from "next/link";
import { SHOP } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Services & Prices — Photo Framing, Glass, Printing, Lamination | Quality Glass Emporium, Raebareli",
  description:
    "Photo framing, custom & made-to-order frames, glass cutting and mirror work, photo printing, lamination, wedding albums, photo restoration and bulk orders — all in Raebareli. See prices and order online.",
};

type Icon = { viewBox: string; d: string };
const ICONS: Record<string, Icon> = {
  frame: { viewBox: "0 0 24 24", d: "M4 3h16v18H4zM7 7h10v10H7z" },
  custom: { viewBox: "0 0 24 24", d: "M12 3l1.8 4.5L18 9.3l-4.2 1.8L12 15l-1.8-3.9L6 9.3l4.2-1.8z" },
  glass: { viewBox: "0 0 24 24", d: "M5 5l5.5 5.5M14 14L19 19M3 9V5a2 2 0 0 1 2-2h4" },
  print: { viewBox: "0 0 24 24", d: "M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" },
  lamination: { viewBox: "0 0 24 24", d: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" },
  album: { viewBox: "0 0 24 24", d: "M6 3h12v18l-6-4-6 4z" },
  restore: { viewBox: "0 0 24 24", d: "M3 12a9 9 0 1 0 9-9M3 12V5m0 7h7" },
  bulk: { viewBox: "0 0 24 24", d: "M3 7h18v13H3zM8 7V4h8v3M3 12h18" },
};

const SERVICES = [
  { key: "frame", en: "Photo Framing", hi: "फोटो फ़्रेमिंग", descEn: "Any size, any photo. Black, golden or wooden mouldings with clear or non-reflective glass and elegant mats.", descHi: "किसी भी साइज़, किसी भी फोटो की। सुनहरी, लकड़ी या काली माउल्डिंग, साफ़ या नॉन-रिफ्लेक्टिव काँच और सुंदर मैट।", price: "from ₹399", link: "/shop?category=photo-frames" },
  { key: "custom", en: "Custom & Made-to-Order Frames", hi: "कस्टम फ़्रेम", descEn: "Upload your photo and build the exact frame you want — size, moulding, glass and mat, with a live price.", descHi: "अपनी फोटो अपलोड करें और मनचाहा फ़्रेम बनाएँ — साइज़, माउल्डिंग, काँच और मैट, लाइव दाम के साथ।", price: "from ₹549", link: "/studio" },
  { key: "glass", en: "Glass Cutting & Mirror Work", hi: "काँच कटिंग व शीशे का काम", descEn: "Window panes, table tops, shelves and mirrors cut to size — measured twice, cut once, edges finished safely.", descHi: "खिड़की, टेबल टॉप, अलमारी और शीशा — हर साइज़ में कटिंग, दो बार मापा, एक बार कटा।", price: "quote by size", link: "/glass-mirror-work-raebareli" },
  { key: "print", en: "Photo Printing", hi: "फोटो प्रिंटिंग", descEn: "Rich-colour glossy, matte and canvas prints — A5, A4, 12×18 and more, printed and framed in one order.", descHi: "गहरे रंगों में ग्लॉसी, मैट और कैनवास प्रिंट — A5, A4, 12×18 और बहुत कुछ।", price: "from ₹99", link: "/shop?category=photo-prints" },
  { key: "lamination", en: "Lamination", hi: "लैमिनेशन", descEn: "Certificates, posters, notice-boards and charts laminated for a clean, long-lasting finish.", descHi: "सर्टिफ़िकेट, पोस्टर, नोटिस-बोर्ड और चार्ट — साफ़ और टिकाऊ फ़िनिश।", price: "from ₹50", link: "/shop" },
  { key: "album", en: "Wedding Albums & Collages", hi: "वेडिंग एल्बम व कोलाज", descEn: "Beautiful, hand-finished albums and collage walls that turn a wedding day into a keepsake.", descHi: "खूबसूरत हाथ से तैयार एल्बम और कोलाज — शादी की याद को खज़ाना बनाएँ।", price: "from ₹1,499", link: "/bulk" },
  { key: "restore", en: "Photo Restoration & Reframing", hi: "फोटो रीस्टोरेशन", descEn: "Old, faded or torn photos cleaned, restored and reframed — they look brand new.", descHi: "पुरानी, फीकी या फटी फोटो साफ़ करके रीस्टोर और रीफ़्रेम करते हैं।", price: "from ₹399", link: "/shop" },
  { key: "bulk", en: "Bulk & Institutional Orders", hi: "बल्क व संस्थागत ऑर्डर", descEn: "Certificates for schools, gifts for offices, frames for events — special pricing and quick turnaround.", descHi: "स्कूल के सर्टिफ़िकेट, ऑफिस गिफ़्ट, इवेंट के फ़्रेम — खास दाम और तेज़ डिलीवरी।", price: "custom quote", link: "/bulk" },
];

export default function ServicesPage() {
  return (
    <main className="relative min-h-[100svh] pb-28 pt-28 md:pt-32">
      <div aria-hidden className="absolute -top-24 right-0 h-[400px] w-[400px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Services · सेवाएँ</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">
          Everything we craft, one shop.
        </h1>
        <p className="mt-2 font-hindi text-lg text-ivory/55">हम जो कुछ भी बनाते हैं — एक ही दुकान पर।</p>
        <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/60 md:text-[15px]">
          From a single photo to a school&apos;s certificates to a full wall of your travels — Quality Glass Emporium at
          PNT Colony does it all. Honest walk-in prices, shown straight on the site. Pick a service below, or just
          WhatsApp us your size and we&apos;ll quote instantly.
        </p>

        {/* services grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.key}
              href={s.link}
              data-cursor="link"
              className="group flex flex-col rounded-2xl border border-ivory/10 bg-white/[0.02] p-6 transition-colors hover:border-gold/40 hover:bg-white/[0.04]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08] text-gold-light">
                <svg viewBox={ICONS[s.key].viewBox} className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICONS[s.key].d} />
                </svg>
              </span>
              <h2 className="mt-5 font-serif text-xl leading-6 text-ivory group-hover:text-gold-light">{s.en}</h2>
              <p className="mt-1 font-hindi text-sm text-ivory/50">{s.hi}</p>
              <p className="mt-3 flex-1 text-[13px] leading-6 text-ivory/60">{s.descEn}</p>
              <p className="mt-2 font-hindi text-[13px] leading-6 text-ivory/45">{s.descHi}</p>
              <span className="mt-4 text-sm font-semibold text-gold-light">{s.price} →</span>
            </Link>
          ))}
        </div>

        {/* price list note */}
        <div className="mt-12 rounded-2xl border border-gold/25 bg-gold/[0.06] p-6 md:p-8">
          <h2 className="font-serif text-2xl text-ivory">Prices set out front, like it should be · दाम सामने, जैसा होना चाहिए</h2>
          <p className="mt-2 font-hindi text-sm text-ivory/55">हर कीमत में फ़्रेम, काँच, मैट और फ़िनिशिंग शामिल है — कोई छिपा ख़र्च नहीं।</p>
          <p className="mt-2 text-sm leading-6 text-ivory/60">
            Every price on the site includes the frame, glass, mount and finishing — no hidden charges. For glass and
            bulk, the fastest way is to WhatsApp us the size (height × width) and we reply with the exact quote within
            minutes.
          </p>
          <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-gold px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light">
            WhatsApp us your size
          </a>
        </div>

        {/* how to order */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", en: "Choose / upload", hi: "चुनें या अपलोड करें", dEn: "Pick a ready frame or upload your photo in the studio.", dHi: "रेडी फ़्रेम चुनें या स्टूडियो में फोटो अपलोड करें।" },
            { n: "02", en: "We quote & craft", hi: "हम कोट और बनाते हैं", dEn: "Confirm on WhatsApp, we hand-craft it at the shop.", dHi: "WhatsApp पर पुष्टि करें, हम दुकान पर हाथ से बनाते हैं।" },
            { n: "03", en: "Pay by UPI", hi: "UPI से पेमेंट करें", dEn: "Scan the QR or send a UPI deep-link payment.", dHi: "QR स्कैन करें या UPI से भेजें।" },
            { n: "04", en: "Pickup or delivery", hi: "पिकअप या डिलीवरी", dEn: "Collect or get it delivered anywhere in Raebareli.", dHi: "रायबरेली में कहीं भी पिकअप या डिलीवरी।" },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5">
              <span className="font-serif text-3xl text-gold/50">{s.n}</span>
              <h3 className="mt-2 font-serif text-lg text-ivory">{s.en}</h3>
              <p className="mt-1 font-hindi text-xs text-ivory/50">{s.hi}</p>
              <p className="mt-2 text-[13px] leading-6 text-ivory/60">{s.dEn}</p>
              <p className="mt-1 font-hindi text-[12px] leading-5 text-ivory/45">{s.dHi}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row">
          <Link href="/shop" className="rounded-full bg-gold px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light">
            Browse the shop
          </Link>
          <Link href="/studio" className="rounded-full border border-ivory/20 px-8 py-4 text-center text-sm font-semibold text-ivory/80 transition-colors hover:border-gold hover:text-gold-light">
            Open the Framing Studio
          </Link>
          <a href={SHOP.phoneHref} className="rounded-full border border-ivory/20 px-8 py-4 text-center text-sm font-semibold text-ivory/80 transition-colors hover:border-gold hover:text-gold-light">
            Call {SHOP.phoneDisplay}
          </a>
        </div>
      </div>
    </main>
  );
}
