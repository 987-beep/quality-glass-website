"use client";

import { useEffect, useRef } from "react";
import { gsap } from "./use-gsap";
import { isTouch, prefersReduced } from "@/lib/fx-helpers";

type Props = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

/** Magnetic hover: gently pulls the inner element towards the pointer. */
export default function Magnetic({ children, className = "", strength = 0.35 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap || isTouch() || prefersReduced()) return;
    const inner =
      wrap.querySelector<HTMLElement>("[data-magnet]") ??
      (wrap.firstElementChild as HTMLElement | null);
    if (!inner) return;

    const xTo = gsap.quickTo(inner, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () =>
      gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
