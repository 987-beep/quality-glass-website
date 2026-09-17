"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, ProductImage } from "@/lib/server/catalog";
import { priceOf, compareOf, discountPct } from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";
import { formatINR } from "@/lib/format";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  en: {
    kicker: "Deal of the day",
    title: "आज का ऑफ़र",
    left: "left",
    ends: "Deal refreshes at midnight",
    cta: "Grab the deal",
  },
  hi: {
    kicker: "दिन का ऑफ़र",
    title: "आज का ऑफ़र",
    left: "बचा है",
    ends: "आधी रात को नया ऑफ़र",
    cta: "ऑफ़र लें",
  },
};

function msToMidnight(): number {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return end.getTime() - now.getTime();
}

export default function DealOfDay({
  deals,
  images,
}: {
  deals: Product[];
  images: ProductImage[];
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const [left, setLeft] = useState(0);

  useEffect(() => {
    setLeft(msToMidnight());
    const id = setInterval(() => setLeft(msToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  // rotating daily pick: day-of-year over the deal pool (Frameley/Santi rotating deal)
  const deal = useMemo(() => {
    if (deals.length === 0) return null;
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return deals[day % deals.length];
  }, [deals]);

  if (!deal) return null;

  const img = primaryImage(deal.slug, images.filter((i) => i.product_id === deal.id));
  const price = priceOf(deal);
  const mrp = compareOf(deal);
  const pct = discountPct(deal);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const sec = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/[0.09] via-transparent to-[#c2402f]/[0.06] p-7 md:grid-cols-[220px_1fr_auto] md:gap-12 md:p-10">
          {/* image */}
          <Link href={`/product/${deal.slug}`} className="relative mx-auto block w-44 md:w-full">
            <div className="gold-frame rounded-[2px] p-[8px] shadow-frame">
              <div className="relative aspect-[4/5] overflow-hidden border border-gold/10 bg-mat">
                <div className="absolute inset-[10px] overflow-hidden bg-ink">
                  <Image src={img.src} alt={img.alt} fill sizes="240px" className="object-cover" />
                </div>
              </div>
            </div>
            {pct > 0 && (
              <span className="absolute -right-3 -top-3 rounded-full bg-[#c2402f] px-3 py-1.5 text-[11px] font-bold text-ivory shadow-lg">
                {pct}% OFF
              </span>
            )}
          </Link>

          {/* copy + countdown */}
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{c.kicker}</p>
            <h2 className="mt-2 font-serif text-3xl text-ivory md:text-4xl">{c.title}</h2>
            <p className="mt-2 text-sm text-ivory/60">
              {String(deal.name[lang as "en" | "hi"] || deal.name.en)}
            </p>
            <p className="mt-3 flex items-baseline justify-center gap-3 md:justify-start">
              <span className="font-serif text-3xl text-gold-light">{formatINR(price)}</span>
              {mrp && mrp > price && (
                <span className="text-sm text-ivory/35 line-through">{formatINR(mrp)}</span>
              )}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 md:justify-start" role="timer" aria-label="deal countdown">
              {[pad(h), pad(m), pad(sec)].map((v, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/40 bg-ink font-mono text-lg font-bold text-gold-light tabular-nums">
                    {v}
                  </span>
                  {i < 2 && <span className="font-mono text-lg text-gold/70">:</span>}
                </span>
              ))}
              <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-ivory/40">{c.left}</span>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ivory/25">{c.ends}</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href={`/product/${deal.slug}`}
              data-cursor="link"
              className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
            >
              {c.cta} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
