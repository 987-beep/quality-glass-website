"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import FramedImage, { type FrameTone } from "@/components/fx/framed-image";
import RevealText from "@/components/fx/reveal-text";
import { prefersReduced } from "@/lib/fx-helpers";
import { formatINR } from "@/lib/format";
import { priceOf, type Product, type ProductImage } from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";

/**
 * Featured frames — fully data-driven: every card is a real, purchasable
 * product, so links always lead to a live product page. Shows at least 8
 * products in a two-across grid (four rows on mobile/desktop alike).
 */
export default function Featured({
  products = [],
  images = [],
}: {
  products?: Product[];
  images?: ProductImage[];
}) {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".fcard"));
      gsap.set(cards, { y: 70, opacity: 0 });
      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.1,
            ease: "power3.out",
          }),
      });
    }, el);
    return () => ctx.revert();
  }, [t, products]);

  if (products.length === 0) return null;

  return (
    <section id="featured" ref={ref} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
              {t.featured.kicker}
            </p>
            <RevealText
              as="h2"
              text={t.featured.title}
              className="max-w-[14ch] font-serif text-4xl leading-[1.05] text-ivory md:text-6xl"
            />
          </div>
          <p className="hidden max-w-[180px] text-right text-[11px] uppercase leading-5 tracking-[0.18em] text-ivory/40 md:block">
            {t.featured.note}
          </p>
        </div>

        {/* 2 per line everywhere; 8 cards minimum (4 rows) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 md:gap-y-16">
          {products.map((p) => {
            const img = primaryImage(
              p.slug,
              images.filter((i) => i.product_id === p.id)
            );
            const name = p.name[lang] || p.name.en || p.slug;
            return (
              <a
                key={p.id}
                href={`/product/${p.slug}`}
                className="fcard group"
                data-cursor="view"
                data-cursor-label="View"
              >
                <FramedImage
                  src={img.src}
                  alt={img.alt}
                  tone={(p.frame_tone as FrameTone | undefined) || "gold"}
                  aspect="aspect-[4/5]"
                  sizes="(max-width: 640px) 46vw, (max-width: 1024px) 46vw, 46vw"
                />
                <div className="mt-4 flex items-start justify-between gap-2 sm:mt-5 sm:gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-base text-ivory transition-colors group-hover:text-gold-light sm:text-xl">
                      {name}
                    </h3>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-ivory/40 sm:text-[10px]">
                      {t.featured.note}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 font-serif text-sm text-gold-light sm:px-3 sm:py-1.5 sm:text-[15px]">
                    {formatINR(priceOf(p))}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/shop"
            data-cursor="link"
            className="inline-flex items-center gap-3 rounded-full border border-ivory/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:border-gold hover:text-gold-light"
          >
            {t.featured.cta}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
