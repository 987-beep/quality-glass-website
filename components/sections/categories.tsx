"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import FramedImage, { type FrameTone } from "@/components/fx/framed-image";
import RevealText from "@/components/fx/reveal-text";
import { prefersReduced } from "@/lib/fx-helpers";

const TONES: FrameTone[] = ["gold", "wood", "gold", "black"];

export default function Categories() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const mm = gsap.matchMedia();

    // Desktop: pinned horizontal scroll through the "gallery rooms"
    mm.add("(min-width: 1024px)", () => {
      const dist = () => Math.max(0, track.scrollWidth - el.clientWidth + 120);
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${Math.max(1, dist())}`, // guard ultra-wide screens
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: "x" });
      };
    });

    // Mobile / tablet: simple rise reveals
    mm.add("(max-width: 1023px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(track.querySelectorAll(".cat-card"));
      const sets = cards.map((c) => {
        gsap.set(c, { y: 60, opacity: 0 });
        return gsap.to(c, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: c, start: "top 88%", once: true },
        });
      });
      return () => sets.forEach((s) => s.kill());
    });

    return () => mm.revert();
  }, [t]);

  return (
    <section
      id="shop"
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:flex lg:h-screen lg:min-h-[760px] lg:flex-col lg:justify-center lg:py-0"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="mb-12 flex items-end justify-between gap-6 lg:mb-16">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
              {t.categories.kicker}
            </p>
            <RevealText
              as="h2"
              text={t.categories.title}
              className="max-w-[14ch] font-serif text-4xl leading-[1.05] text-ivory md:text-6xl"
            />
          </div>
          <a
            href="/shop"
            data-cursor="link"
            className="hidden items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ivory/50 transition-colors hover:text-gold-light lg:flex"
          >
            {t.categories.cta}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 md:px-10 lg:w-max lg:max-w-none lg:flex-row lg:gap-10 lg:px-10 lg:pr-28"
      >
        {t.categories.items.map((it, i) => (
          <a
            key={it.tag}
            href={it.href}
            className="cat-card group relative block shrink-0 lg:w-[400px] xl:w-[430px]"
            data-cursor="view"
            data-cursor-label="View"
          >
            <FramedImage
              src={it.img}
              alt={it.title}
              tone={TONES[i % TONES.length]}
              aspect="aspect-[4/5]"
              sizes="(max-width: 1024px) 92vw, 30vw"
            />
            <div className="mt-6 flex items-start justify-between">
              <div>
                <span className="font-serif text-sm italic text-gold">{it.tag}</span>
                <h3 className="mt-1 font-serif text-2xl text-ivory md:text-[1.7rem]">{it.title}</h3>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-ivory/40">
                  {it.desc}
                </p>
              </div>
              <span className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
