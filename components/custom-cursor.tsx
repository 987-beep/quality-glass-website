"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/fx/use-gsap";
import { isTouch, prefersReduced } from "@/lib/fx-helpers";

type Mode = "default" | "link" | "view" | "drag";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (isTouch() || prefersReduced()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      if (t) {
        setMode((t.dataset.cursor as Mode) || "link");
        setLabel(t.dataset.cursorLabel || "");
      } else {
        setMode("default");
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  useEffect(() => {
    if (!ringRef.current) return;
    gsap.to(ringRef.current, {
      scale: mode === "view" || mode === "drag" ? 2.6 : mode === "link" ? 1.6 : 1,
      duration: 0.35,
      ease: "power3.out",
    });
  }, [mode]);

  const big = mode === "view" || mode === "drag";

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[95] hidden h-1.5 w-1.5 rounded-full bg-white mix-blend-difference lg:block"
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[95] hidden h-9 w-9 items-center justify-center rounded-full lg:flex ${
          big
            ? "border-none bg-gold/95 text-ink"
            : "border border-gold/70 bg-transparent text-transparent"
        }`}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
    </>
  );
}
