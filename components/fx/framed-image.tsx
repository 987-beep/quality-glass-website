"use client";

import Image from "next/image";
import { useGsap, gsap } from "./use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";

export type FrameTone = "gold" | "wood" | "black";

const TONES: Record<FrameTone, string> = {
  gold: "gold-frame",
  wood: "wood-frame",
  black: "black-frame",
};

type Props = {
  src: string;
  alt: string;
  tone?: FrameTone;
  className?: string;
  aspect?: string;
  priority?: boolean;
  strokes?: boolean;
  parallax?: boolean;
  sizes?: string;
};

/**
 * The signature component: a photo inside a metallic moulding + cream mat,
 * with golden stroke-lines drawn around it as it scrolls into view,
 * plus a subtle scr-ube-driven parallax inside the mat window.
 */
export default function FramedImage({
  src,
  alt,
  tone = "gold",
  className = "",
  aspect = "aspect-[4/5]",
  priority = false,
  strokes = true,
  parallax = true,
  sizes = "(max-width: 768px) 92vw, 45vw",
}: Props) {
  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;

    if (strokes) {
      gsap.set(q(".fs-t,.fs-b"), { scaleX: 0 });
      gsap.set(q(".fs-l,.fs-r"), { scaleY: 0 });
    }
    gsap.set(q(".fi-mat"), { clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(q(".fi-img"), { scale: 1.28 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      scrollTrigger: { trigger: el, start: "top 84%", once: true },
    });

    if (strokes) {
      tl.to(q(".fs-t"), { scaleX: 1, duration: 0.5 }, 0)
        .to(q(".fs-r"), { scaleY: 1, duration: 0.5 }, 0.12)
        .to(q(".fs-b"), { scaleX: 1, duration: 0.5 }, 0.24)
        .to(q(".fs-l"), { scaleY: 1, duration: 0.5 }, 0.36);
    }

    tl.to(
      q(".fi-mat"),
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.95 },
      strokes ? 0.3 : 0
    ).to(
      q(".fi-img"),
      { scale: 1.12, duration: 1.5, ease: "power3.out" },
      strokes ? 0.45 : 0.15
    );

    if (parallax) {
      gsap.fromTo(
        q(".fi-img"),
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }
  }, [src, tone]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {strokes && (
        <>
          <span aria-hidden className="fs-t absolute -top-2 -left-2 -right-2 h-[2px] origin-left bg-gold" />
          <span aria-hidden className="fs-r absolute -top-2 -bottom-2 -right-2 w-[2px] origin-top bg-gold" />
          <span aria-hidden className="fs-b absolute -bottom-2 -left-2 -right-2 h-[2px] origin-right bg-gold" />
          <span aria-hidden className="fs-l absolute -top-2 -bottom-2 -left-2 w-[2px] origin-bottom bg-gold" />
        </>
      )}
      <div className={`${TONES[tone]} rounded-[2px] p-[9px] shadow-frame md:p-[11px]`}>
        <div className="fi-mat bg-[#F3EDE0] p-[7%]">
          <div className={`relative overflow-hidden ${aspect}`}>
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes={sizes}
              className="fi-img object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
