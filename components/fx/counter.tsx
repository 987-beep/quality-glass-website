"use client";

import { useRef } from "react";
import { useGsap, gsap } from "./use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";

type Props = {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
};

export default function Counter({
  value,
  suffix = "",
  decimals = 0,
  className = "",
}: Props) {
  const numRef = useRef<HTMLSpanElement>(null);

  const fmt = (v: number) =>
    decimals > 0
      ? v.toFixed(decimals) + suffix
      : Math.round(v).toLocaleString("en-IN") + suffix;

  const ref = useGsap((el) => {
    const node = numRef.current;
    if (!node) return;
    if (prefersReduced()) {
      node.textContent = fmt(value);
      return;
    }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: value,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        node.textContent = fmt(obj.v);
      },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, [value, decimals, suffix]);

  return (
    <span ref={ref} className={className}>
      <span ref={numRef}>{fmt(0)}</span>
    </span>
  );
}
