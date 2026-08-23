"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import FramedImage, { type FrameTone } from "@/components/fx/framed-image";
import RevealText from "@/components/fx/reveal-text";
import { prefersReduced } from "@/lib/fx-helpers";

// order matches t.featured.items
const FEATURED_SLUGS = [
  "royal-gold-frame",
  "classic-teak-frame",
  "canvas-photo-wrap",
  "moderna-black-frame",
];

export default function Featured() {
  const { t } = useLanguage();
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
  }, [t]);

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

        <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {t.featured.items.map((p, i) => (
            <a
              key={p.name + i}
              href={`/product/${FEATURED_SLUGS[i % FEATURED_SLUGS.length]}`}
              className="fcard group"
              data-cursor="view"
              data-cursor-label="View"
            >
              <FramedImage
                src={p.img}
                alt={p.name}
                tone={(p.tone as FrameTone) || "gold"}
                aspect="aspect-[4/5]"
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 22vw"
              />
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl text-ivory transition-colors group-hover:text-gold-light">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ivory/40">
                    {t.featured.note}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 font-serif text-[15px] text-gold-light">
                  {p.price}
                </span>
              </div>
            </a>
          ))}
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
