"use client";

import { useGsap, gsap } from "./use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p";
};

/** Word-by-word masked text reveal on scroll. */
export default function RevealText({
  text,
  className = "",
  delay = 0,
  as = "span",
}: Props) {
  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;
    gsap.set(q(".rvi"), { yPercent: 112 });
    gsap.to(q(".rvi"), {
      yPercent: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.045,
      delay,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, [text, delay]);

  const Tag = as as React.ElementType;
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
        >
          <span className="rvi inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
