"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import RevealText from "@/components/fx/reveal-text";
import { SHOP } from "@/lib/site-config";
import { prefersReduced } from "@/lib/fx-helpers";

export default function Testimonials() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".tc"));
      gsap.set(cards, { y: 60, opacity: 0 });
      ScrollTrigger.batch(cards, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          }),
      });
    }, el);
    return () => ctx.revert();
  }, [t]);

  const scrollBy = (dir: number) => {
    const s = scrollerRef.current;
    if (!s) return;
    s.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  return (
    <section id="reviews" ref={ref} className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
              {t.testimonials.kicker}
            </p>
            <RevealText
              as="h2"
              text={t.testimonials.title}
              className="max-w-[16ch] font-serif text-4xl leading-[1.05] text-ivory md:text-6xl"
            />
          </div>
          <a
            href={SHOP.justdial}
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className="hidden items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold-light transition-colors hover:bg-gold/20 sm:flex"
          >
            <span aria-hidden className="text-gold">★</span>
            {t.testimonials.badge}
          </a>
        </div>

        <div
          ref={scrollerRef}
          data-cursor="drag"
          data-cursor-label="Drag"
          className="scrollbar-hide -mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:-mx-10 md:px-10"
        >
          {t.testimonials.items.map((r, i) => (
            <figure
              key={r.name + i}
              className="tc relative w-[84vw] max-w-[340px] shrink-0 snap-start border border-gold/15 bg-white/[0.04] p-6 shadow-card backdrop-blur-sm sm:w-[380px] sm:max-w-none md:p-7"
            >
              <span aria-hidden className="absolute -top-1 right-5 select-none font-serif text-7xl text-gold/20">
                ”
              </span>
              <div aria-hidden className="flex gap-1 text-sm tracking-[0.2em] text-gold">
                ★★★★★
              </div>
              <blockquote className="mt-4 font-serif text-[17px] leading-7 text-ivory/85 md:text-lg md:leading-8">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="gold-frame flex h-11 w-11 items-center justify-center rounded-full p-[3px]">
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-ink font-sans text-[11px] font-bold tracking-wide text-gold-light">
                    {r.initials}
                  </span>
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ivory">{r.name}</span>
                  <span className="block text-xs text-ivory/45">{r.area}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 hidden justify-end gap-3 lg:flex">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Previous reviews"
            data-cursor="link"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m6-7l-7 7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Next reviews"
            data-cursor="link"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
