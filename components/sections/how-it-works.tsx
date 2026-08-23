"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import FramedImage from "@/components/fx/framed-image";
import { prefersReduced } from "@/lib/fx-helpers";

export default function HowItWorks() {
  const { t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const wrap = wrapRef.current;
    if (!wrap) return;

    const mm = gsap.matchMedia();

    // Desktop: pinned scrollytelling chapters
    mm.add("(min-width: 1024px)", () => {
      const slides = gsap.utils.toArray<HTMLElement>(wrap.querySelectorAll(".hiw-slide"));
      const prog = wrap.querySelector(".hiw-prog");
      gsap.set(slides.slice(1), { autoAlpha: 0, y: 70 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
      tl.to({}, { duration: 0.6 }); // hold first chapter
      slides.forEach((s, i) => {
        if (i === 0) return;
        tl.to(slides[i - 1], { autoAlpha: 0, y: -70, duration: 0.7, ease: "power2.inOut" }, i)
          .to(s, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.inOut" }, i + 0.35);
      });
      tl.to({}, { duration: 0.6 }); // hold last chapter
      if (prog) {
        tl.fromTo(prog, { scaleY: 0 }, { scaleY: 1, duration: tl.duration(), ease: "none" }, 0);
      }
      return () => tl.kill();
    });

    // Mobile: simple reveals
    mm.add("(max-width: 1023px)", () => {
      const slides = gsap.utils.toArray<HTMLElement>(wrap.querySelectorAll(".hiw-slide"));
      const tweens = slides.map((s) => {
        gsap.set(s, { y: 50, opacity: 0 });
        return gsap.to(s, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: s, start: "top 85%", once: true },
        });
      });
      return () => tweens.forEach((tw) => tw.kill());
    });

    return () => mm.revert();
  }, [t]);

  return (
    <section id="studio" className="relative border-y border-gold/10 bg-ink-2 text-ivory">
      <div ref={wrapRef} className="relative lg:h-[430vh]">
        <div className="relative lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:overflow-hidden">
          {/* persistent header */}
          <div className="pointer-events-none absolute left-5 top-8 z-20 md:left-10 lg:top-12">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-light md:text-[11px]">
              {t.how.kicker}
            </p>
            <h2 className="max-w-[22ch] font-serif text-2xl leading-snug text-ivory/90 md:text-3xl">
              {t.how.title}
            </h2>
          </div>

          {/* progress rail */}
          <div aria-hidden className="absolute right-8 top-1/2 hidden h-44 w-px -translate-y-1/2 bg-ivory/15 lg:block">
            <span className="hiw-prog block h-full w-full origin-top scale-y-0 bg-gold" />
          </div>

          <div className="relative w-full lg:h-full">
            {t.how.steps.map((s) => (
              <div
                key={s.n}
                className="hiw-slide relative grid gap-10 px-5 py-20 first:pt-32 md:px-10 lg:absolute lg:inset-0 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-4 lg:py-0 lg:pl-28 lg:pr-36 lg:first:pt-0"
              >
                <div className="order-2 lg:order-1">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-16 left-2 select-none font-serif text-[7.5rem] leading-none text-gold/10 md:text-[10rem] lg:left-16 lg:top-8 lg:text-[16rem]"
                  >
                    {s.n}
                  </span>
                  <div className="relative">
                    <h3 className="max-w-[16ch] pt-16 font-serif text-3xl leading-tight text-ivory md:text-5xl lg:pt-40">
                      {s.title}
                    </h3>
                    <p className="mt-5 max-w-md text-[15px] leading-7 text-ivory/60 md:text-base md:leading-8">
                      {s.desc}
                    </p>
                  </div>
                </div>
                <div className="order-1 mx-auto w-full max-w-[300px] md:max-w-[340px] lg:order-2 lg:max-w-[380px]">
                  <FramedImage
                    src={s.img}
                    alt={s.title}
                    tone="black"
                    aspect="aspect-[4/5]"
                    strokes={false}
                    sizes="(max-width: 1024px) 72vw, 28vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
