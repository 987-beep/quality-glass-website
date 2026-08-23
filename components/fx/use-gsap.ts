"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Q = (selector: string) => Element[];

/**
 * Scoped GSAP hook: cb receives the root element and a scoped selector.
 * All animations / ScrollTriggers inside are auto-reverted on unmount
 * or when deps change.
 */
export function useGsap(cb: (el: HTMLElement, q: Q) => void, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const q = gsap.utils.selector(el) as unknown as Q;
    const ctx = gsap.context(() => cb(el, q), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export { gsap, ScrollTrigger };
