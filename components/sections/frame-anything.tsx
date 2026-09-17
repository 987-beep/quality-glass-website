"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

/** Frameley "What can you frame?" marquee — occasion tiles → existing SEO landing pages. */
const TILES: { emoji: string; en: string; hi: string; href: string }[] = [
  { emoji: "💍", en: "Wedding album", hi: "वेडिंग एल्बम", href: "/wedding-album-framing-raebareli" },
  { emoji: "🛕", en: "God & mandir", hi: "भगवान / मंदिर", href: "/god-frame-mandir-raebareli" },
  { emoji: "🎓", en: "Certificates", hi: "सर्टिफिकेट", href: "/certificate-framing-raebareli" },
  { emoji: "🏮", en: "Anime posters", hi: "एनिमे पोस्टर", href: "/anime-poster-framing-raebareli" },
  { emoji: "🎁", en: "Photo gifts", hi: "फोटो गिफ्ट", href: "/photo-gift-frames-raebareli" },
  { emoji: "👨‍👩‍👧", en: "Family photos", hi: "फ़ैमिली फ़ोटो", href: "/photo-framing-raebareli" },
  { emoji: "🏢", en: "Office bulk", hi: "ऑफ़िस बल्क", href: "/office-bulk-frames-raebareli" },
  { emoji: "🪞", en: "Glass & mirror", hi: "ग्लास व मिरर", href: "/glass-mirror-work-raebareli" },
  { emoji: "✨", en: "Custom frames", hi: "कस्टम फ्रेम", href: "/custom-frames-raebareli" },
];

const COPY = {
  en: { kicker: "What can you frame?", title: "Frame anything that matters" },
  hi: { kicker: "क्या-क्या फ्रेम कर सकते हैं?", title: "हर यादगार चीज़ का फ्रेम" },
};

export default function FrameAnything() {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const list = [...TILES, ...TILES]; // seamless loop

  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{c.kicker}</p>
        <h2 className="mt-2 text-center font-serif text-2xl text-ivory md:text-3xl">{c.title}</h2>
      </div>

      <div className="relative mt-7 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-[faMarquee_36s_linear_infinite] gap-4 px-2 hover:[animation-play-state:paused]">
          {list.map((t, i) => (
            <Link
              key={`${t.href}-${i}`}
              href={t.href}
              data-cursor="link"
              className="group flex shrink-0 items-center gap-3 rounded-2xl border border-ivory/10 bg-white/[0.02] px-6 py-4 transition-all duration-300 hover:border-gold/50 hover:bg-gold/[0.06]"
            >
              <span className="text-2xl" aria-hidden>{t.emoji}</span>
              <div>
                <p className="whitespace-nowrap text-sm font-semibold text-ivory group-hover:text-gold-light">
                  {t.en}
                </p>
                <p className="text-[10px] text-ivory/35">{t.hi}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes faMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
