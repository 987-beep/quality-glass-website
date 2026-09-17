"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

const SIZES: { label: string; sub: string; href: string; from: string }[] = [
  { label: "4×6", sub: "Photo", href: "/photo-framing-raebareli", from: "₹149" },
  { label: "A4", sub: "Certificate", href: "/certificate-framing-raebareli", from: "₹299" },
  { label: "12×16", sub: "Frame", href: "/custom-frames-raebareli", from: "₹499" },
  { label: "A3", sub: "Poster", href: "/anime-poster-framing-raebareli", from: "₹799" },
  { label: "16×20", sub: "Mirror", href: "/glass-mirror-work-raebareli", from: "₹999" },
  { label: "24×36", sub: "Wedding", href: "/wedding-album-framing-raebareli", from: "₹1,999" },
];

const COPY = {
  en: { kicker: "Shop by size", title: "Har size ka frame", cta: "Custom size" },
  hi: { kicker: "साइज़ अनुसार", title: "हर साइज़ का फ्रेम", cta: "कस्टम साइज़" },
};

/** Printo "Shop by Sizes" pattern: size tiles with starting prices → SEO landing pages. */
export default function SizeStrip() {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;

  return (
    <section className="relative py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{c.kicker}</p>
            <h2 className="mt-2 font-serif text-2xl text-ivory md:text-3xl">{c.title}</h2>
          </div>
          <Link
            href="/custom-frames-raebareli"
            data-cursor="link"
            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory/50 transition-colors hover:text-gold-light"
          >
            {c.cta} →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-6">
          {SIZES.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              data-cursor="link"
              className="group rounded-xl border border-ivory/10 bg-white/[0.02] px-3 py-4 text-center transition-all duration-300 hover:border-gold/50 hover:bg-gold/[0.05]"
            >
              <p className="font-serif text-xl text-ivory group-hover:text-gold-light">{s.label}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-ivory/35">{s.sub}</p>
              <p className="mt-2 text-[11px] font-semibold text-gold-light">{s.from} से</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
