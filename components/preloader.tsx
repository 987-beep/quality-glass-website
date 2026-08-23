"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/components/fx/use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";

const LINES = ["QUALITY", "GLASS"];

/** Frame-assembles-around-logo preloader with 0→100 counter. */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced()) {
      setGone(true);
      return;
    }
    const el = root.current;
    if (!el) return;
    const A = (s: string) => el.querySelectorAll(s);
    const count = el.querySelector<HTMLElement>(".pl-count");
    const obj = { v: 0 };

    document.documentElement.style.overflow = "hidden";
    (
      window as unknown as { lenis?: { stop: () => void; start: () => void } }
    ).lenis?.stop();

    gsap.set(A(".pl-l"), { yPercent: 115 });
    gsap.set(A(".pl-bt,.pl-bb"), { scaleX: 0 });
    gsap.set(A(".pl-bl,.pl-br"), { scaleY: 0 });
    gsap.set(A(".pl-sub"), { opacity: 0, y: 10 });

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        (
          window as unknown as { lenis?: { start: () => void } }
        ).lenis?.start();
        setGone(true);
      },
    });

    tl.to(A(".pl-bt"), { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, 0)
      .to(A(".pl-br"), { scaleY: 1, duration: 0.55, ease: "power2.inOut" }, 0.12)
      .to(A(".pl-bb"), { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, 0.24)
      .to(A(".pl-bl"), { scaleY: 1, duration: 0.55, ease: "power2.inOut" }, 0.36)
      .to(
        A(".pl-l"),
        { yPercent: 0, stagger: 0.045, duration: 0.8, ease: "power4.out" },
        0.2
      )
      .to(
        obj,
        {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count) count.textContent = `${Math.round(obj.v)}%`;
          },
        },
        0.2
      )
      .to(A(".pl-sub"), { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.8)
      .to(A(".pl-inner"), { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.3")
      .to(A(".pl-count"), { opacity: 0, duration: 0.3 }, "<")
      .to(el, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "<0.12");

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink">
      <div className="pl-inner relative">
        <div className="relative h-[280px] w-[216px] md:h-[340px] md:w-[264px]">
          <span className="pl-bt gold-frame absolute -top-[6px] left-0 right-0 h-[7px] origin-left" />
          <span className="pl-br gold-frame absolute -right-[6px] top-0 bottom-0 w-[7px] origin-top" />
          <span className="pl-bb gold-frame absolute -bottom-[6px] left-0 right-0 h-[7px] origin-right" />
          <span className="pl-bl gold-frame absolute -left-[6px] top-0 bottom-0 w-[7px] origin-bottom" />
          <div className="flex h-full w-full flex-col items-center justify-center px-4">
            {LINES.map((line) => (
              <div key={line} className="overflow-hidden">
                <div className="flex justify-center font-serif text-3xl tracking-[0.2em] text-ivory md:text-4xl">
                  {line.split("").map((c, i) => (
                    <span key={i} className="pl-l inline-block will-change-transform">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p className="pl-sub mt-4 text-center text-[9px] uppercase tracking-[0.32em] text-ivory/50 md:text-[10px]">
              Emporium &amp; Photo Framing · Est. 2018
            </p>
          </div>
        </div>
      </div>
      <div className="pl-count absolute bottom-7 right-7 font-serif text-5xl text-gold md:text-6xl">
        0%
      </div>
    </div>
  );
}
