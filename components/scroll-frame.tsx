"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "@/lib/fx-helpers";

/**
 * Signature touch: a golden frame border is drawn around the viewport
 * as the visitor scrolls through the page.
 */
export default function ScrollFrame() {
  const top = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  const bottom = useRef<HTMLSpanElement>(null);
  const left = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (top.current) top.current.style.transform = `scaleX(${clamp01(p / 0.3)})`;
      if (right.current) right.current.style.transform = `scaleY(${clamp01((p - 0.3) / 0.3)})`;
      if (bottom.current) bottom.current.style.transform = `scaleX(${clamp01((p - 0.6) / 0.3)})`;
      if (left.current) left.current.style.transform = `scaleY(${clamp01((p - 0.9) / 0.1)})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <span ref={top} className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-gold" />
      <span ref={right} className="absolute right-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-gold" />
      <span ref={bottom} className="absolute bottom-0 left-0 h-[3px] w-full origin-right scale-x-0 bg-gold" />
      <span ref={left} className="absolute left-0 top-0 h-full w-[3px] origin-bottom scale-y-0 bg-gold" />
    </div>
  );
}
