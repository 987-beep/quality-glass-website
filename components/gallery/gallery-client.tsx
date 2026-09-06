"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";

type Work = { src: string; en: string; hi: string; tag: string };

const WORKS: Work[] = [
  { src: "/images/hero-wedding.jpg", en: "Wedding album — gold leaf frame", hi: "शादी एल्बम — सोने की पत्ती फ़्रेम", tag: "Wedding" },
  { src: "/images/hero-family.jpg", en: "Family portrait, walnut moulding", hi: "पारिवारिक पोर्ट्रेट, अखरोट माउल्डिंग", tag: "Portrait" },
  { src: "/images/hero-travel.jpg", en: "Travel wall set, 4-piece", hi: "ट्रैवल वॉल सेट, 4 पीस", tag: "Wall Set" },
  { src: "/images/prod-gan-utsav.jpg", en: "Ganesha Utsav god frame", hi: "गणेश उत्सव गॉड फ़्रेम", tag: "God Frame" },
  { src: "/images/prod-krishna-murli.jpg", en: "Krishna Murli night frame", hi: "कृष्ण मुरली नाइट फ़्रेम", tag: "God Frame" },
  { src: "/images/prod-isl-ayatul.jpg", en: "Ayatul Kursi wall art", hi: "आयतुल कुर्सी वॉल आर्ट", tag: "Islamic Art" },
  { src: "/images/prod-ani-naruto.jpg", en: "Naruto Rasengan frame", hi: "नारुतो रसेंगन फ़्रेम", tag: "Anime" },
  { src: "/images/prod-cf-shadowbox.jpg", en: "Shadow-box keepsake frame", hi: "शैडो-बॉक्स स्मृति फ़्रेम", tag: "Custom" },
  { src: "/images/prod-pf-modern.jpg", en: "Modern minimal photo frame", hi: "मॉडर्न मिनिमल फोटो फ़्रेम", tag: "Modern" },
  { src: "/images/prod-pf-royalgold.jpg", en: "Royal gold gifting frame", hi: "रॉयल गोल्ड गिफ़्ट फ़्रेम", tag: "Gifting" },
  { src: "/images/prod-pf-walnut.jpg", en: "Certificate framing batch", hi: "सर्टिफ़िकेट फ़्रेमिंग बैच", tag: "Office" },
  { src: "/images/prod-cf-doublemat.jpg", en: "Custom collage, double mat", hi: "कस्टम कोलाज, डबल मैट", tag: "Custom" },
];

const FILTERS = ["All", "Wedding", "Portrait", "God Frame", "Anime", "Custom", "Gifting", "Office"];

export default function GalleryClient() {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const list = filter === "All" ? WORKS : WORKS.filter((w) => w.tag === filter);
  const current = lightbox !== null ? WORKS[lightbox] : null;

  const step = useCallback((dir: number) => {
    setLightbox((idx) => (idx === null ? idx : (idx + dir + WORKS.length) % WORKS.length));
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  return (
    <main className="relative min-h-[100svh] pb-28 pt-28 md:pt-32">
      <div aria-hidden className="absolute -top-24 left-1/4 h-[360px] w-[360px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1300px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Our recent work · हमारा काम</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">
          {lang === "hi" ? "हम रायबरेली की दीवारें सजाते हैं।" : "Framed by hand, loved by Raebareli."}
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/60 md:text-[15px]">
          {lang === "hi"
            ? "ये कुछ फ़्रेम, गॉड फ़्रेम, एल्बम और आर्ट पीस हैं जो हमने रायबरेली के परिवारों के लिए बनाए। अपना चुनें, या दुकान पर आएँ।"
            : "A few of the frames, god frames, albums and art pieces we've crafted for families across Raebareli. Want one of your own? Pick a design or visit the shop."}
        </p>

        {/* filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                data-cursor="link"
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  active ? "border-gold bg-gold text-ink shadow-glowgold" : "border-ivory/15 text-ivory/60 hover:border-gold/60 hover:text-gold-light"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* grid */}
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-7 md:gap-y-12 lg:grid-cols-3">
          {list.map((w, i) => {
            const idx = WORKS.indexOf(w);
            return (
              <button
                key={w.src + i}
                onClick={() => setLightbox(idx)}
                data-cursor="view"
                className="group text-left"
              >
                <div className="gold-frame rounded-[2px] p-[7px] shadow-frame transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[0.5deg] md:p-[9px]">
                  <div className="relative aspect-[4/5] overflow-hidden border border-gold/10 bg-mat">
                    <div className="absolute inset-[8px] overflow-hidden bg-ink md:inset-2.5">
                      <Image
                        src={w.src}
                        alt={w.en}
                        fill
                        sizes="(max-width:640px) 46vw, 320px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
                  <span className="truncate text-sm font-medium text-ivory/85">{lang === "hi" ? w.hi : w.en}</span>
                  <span className="shrink-0 rounded-full border border-gold/30 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-light">
                    {w.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-ink-2 via-ink to-ink-2 p-8 md:p-12">
          <h2 className="font-serif text-3xl text-ivory md:text-4xl">
            {lang === "hi" ? "अपनी याद को इस तरह फ़्रेम करें।" : "Get yours framed like this."}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ivory/55">
            {lang === "hi"
              ? "कस्टम स्टूडियो में अपनी फोटो अपलोड करें और फ़्रेम में देखें — या WhatsApp पर भेजें।"
              : "Upload your photo in the Custom Framing Studio and watch it in a frame — or just send it on WhatsApp."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="rounded-full bg-gold px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light">
              Open the Framing Studio
            </Link>
            <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="rounded-full border border-ivory/20 px-8 py-4 text-center text-sm font-semibold text-ivory/80 transition-colors hover:border-gold hover:text-gold-light">
              WhatsApp us
            </a>
          </div>
        </div>
      </div>

      {/* lightbox */}
      {current && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md" onClick={() => setLightbox(null)}>
          <button className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory" data-cursor="link" aria-label="Close" onClick={() => setLightbox(null)}>
            ✕
          </button>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-ivory/25 px-4 py-3 text-ivory md:left-8" data-cursor="link" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>
            ‹
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-ivory/25 px-4 py-3 text-ivory md:right-8" data-cursor="link" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>
            ›
          </button>
          <div className="gold-frame max-h-[82vh] max-w-[86vw] rounded-[2px] p-2 md:p-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-h-[76vh] max-w-[80vw] overflow-hidden border border-gold/10 bg-ink">
              <Image src={current.src} alt={current.en} width={1200} height={1500} className="h-full w-auto max-h-[76vh] object-contain" />
            </div>
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-ivory/70">
            {lang === "hi" ? current.hi : current.en} · {current.tag}
          </p>
        </div>
      )}
    </main>
  );
}
