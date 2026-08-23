"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReduced } from "@/lib/fx-helpers";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (prefersReduced()) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // if the preloader is still up, hold the scroll until it finishes
    if (document.documentElement.style.overflow === "hidden") lenis.stop();

    lenis.on("scroll", (e: { velocity: number }) => {
      ScrollTrigger.update();
      const v = Math.max(-1, Math.min(1, e.velocity / 14));
      document.documentElement.style.setProperty(
        "--mq-skew",
        `${(v * 4).toFixed(2)}deg`
      );
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
