"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGsap, gsap } from "@/components/fx/use-gsap";
import { prefersReduced, isTouch } from "@/lib/fx-helpers";
import { useLanguage } from "@/components/providers/language-provider";
import FramedImage, { type FrameTone } from "@/components/fx/framed-image";
import RevealText from "@/components/fx/reveal-text";
import Magnetic from "@/components/fx/magnetic";
import { SHOP } from "@/lib/site-config";
import type { Product, ProductImage } from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";

/** Stepped auto-slider of featured product photos (advances every 4s, seamless loop). */
const SPOT_W = 96; // thumb width px
const SPOT_GAP = 12;

function HeroSpotlight({ items, kicker }: { items: { slug: string; name: string; src: string }[]; kicker: string }) {
  const [idx, setIdx] = useState(0);
  const [noAnim, setNoAnim] = useState(false);
  const paused = useRef(false);
  const total = items.length;

  useEffect(() => {
    if (total < 2 || prefersReduced()) return;
    const id = setInterval(() => {
      if (!paused.current) setIdx((i) => i + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [total]);

  // slide onto the duplicated head, then silently snap back for an infinite loop
  useEffect(() => {
    if (idx !== total) return;
    const t = setTimeout(() => {
      setNoAnim(true);
      setIdx(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setNoAnim(false)));
    }, 780); // matches the 700ms transition + buffer
    return () => clearTimeout(t);
  }, [idx, total]);

  if (total < 2) return null;
  const slides = [...items, ...items.slice(0, Math.min(5, total))];
  const step = SPOT_W + SPOT_GAP;

  return (
    <div
      className="h-strip w-full"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <p className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.28em] text-gold/90 sm:text-[10px]">
        <span className="h-1 w-1 rotate-45 bg-gold" />
        {kicker}
      </p>
      <div
        className="w-full overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0, #000 26px, #000 calc(100% - 26px), transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 26px, #000 calc(100% - 26px), transparent 100%)" }}
      >
        <div
          className="flex"
          style={{
            gap: SPOT_GAP,
            transform: `translateX(${-idx * step}px)`,
            transition: noAnim ? "none" : "transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        >
          {slides.map((s, i) => (
            <a
              key={`${s.slug}-${i}`}
              href={`/product/${s.slug}`}
              title={s.name}
              aria-label={s.name}
              data-cursor="view"
              className="group relative shrink-0 overflow-hidden rounded-xl border border-gold/25 transition-all duration-300 hover:border-gold-light/60 hover:shadow-[0_8px_28px_-8px_rgba(212,175,55,0.45)]"
              style={{ width: SPOT_W, height: SPOT_W }}
            >
              <Image
                src={s.src}
                alt={s.name}
                width={SPOT_W * 2}
                height={SPOT_W * 2}
                sizes={`${SPOT_W}px`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="block truncate text-[9px] font-medium text-ivory">{s.name}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      {/* dots */}
      <div className="mt-3 flex gap-1.5">
        {items.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            aria-label={`Show ${s.name}`}
            onClick={() => setIdx(i)}
            className={`h-1 rounded-full transition-all duration-300 ${idx % total === i ? "w-5 bg-gold" : "w-1.5 bg-ivory/20 hover:bg-ivory/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

type HFrame = {
  src: string;
  alt: string;
  tone: FrameTone;
  cls: string;
  speed: number;
};

const FRAMES: HFrame[] = [
  {
    src: "/images/hero-wedding.jpg",
    alt: "Framed wedding photograph",
    tone: "gold",
    cls: "z-30 w-[46%] -rotate-2 lg:absolute lg:left-[27%] lg:top-6 lg:w-[46%] lg:rotate-0",
    speed: 0.6,
  },
  {
    src: "/images/hero-family.jpg",
    alt: "Framed family portrait",
    tone: "wood",
    cls: "z-20 -ml-5 w-[34%] -rotate-[5deg] lg:absolute lg:left-0 lg:top-24 lg:ml-0 lg:w-[40%]",
    speed: 1.15,
  },
  {
    src: "/images/hero-travel.jpg",
    alt: "Framed travel photograph",
    tone: "black",
    cls: "z-10 -ml-4 w-[33%] rotate-[4deg] lg:absolute lg:bottom-0 lg:right-0 lg:ml-0 lg:w-[38%]",
    speed: 1.55,
  },
];

type WallImage = { src: string; alt: string };

/**
 * Featured-product photo wall that sits BEHIND the three tilted frames,
 * where there used to be plain black. Slides a new photo in every 4s.
 */
function WallSlider({ images }: { images: WallImage[] }) {
  const n = images.length;
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (n < 2 || prefersReduced()) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setCur((v) => (v + 1) % n);
    }, 4000);
    return () => clearInterval(id);
  }, [n]);

  if (n === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-4 -inset-y-6 z-0 overflow-hidden rounded-[2rem] border border-ivory/[0.07] bg-ink/40 sm:-inset-x-8 lg:-inset-10"
    >
      {images.map((img, i) => {
        const active = i === cur;
        const wasActive = i === (cur - 1 + n) % n;
        return (
          // local /product-pool images — plain img keeps the layer cheap
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.src + i}
            src={img.src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[950ms] ease-out ${
              active
                ? "translate-x-0 opacity-[0.58] saturate-[1.05]"
                : wasActive
                  ? "-translate-x-10 opacity-0"
                  : "translate-x-12 opacity-0"
            }`}
          />
        );
      })}
      {/* studio-grade dimming so the frames on top stay the hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-transparent to-transparent lg:from-transparent" />
      <div className="absolute inset-0 ring-1 ring-inset ring-ivory/10" />
    </div>
  );
}

export default function Hero({
  wallImages = [],
  products = [],
  images = [],
}: {
  wallImages?: WallImage[];
  products?: Product[];
  images?: ProductImage[];
}) {
  const { t, lang } = useLanguage();

  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;

    gsap.set(q(".h-frame"), {
      y: 90,
      opacity: 0,
      rotate: (i: number) => (i === 0 ? -1.5 : i === 1 ? -7 : 5.5),
    });
    gsap.set(q(".h-badge,.h-sub,.h-ctas,.h-note,.h-strip"), { y: 24, opacity: 0 });

    const tl = gsap.timeline({ delay: 2.35, defaults: { ease: "power4.out" } });
    tl.to(q(".h-badge"), { y: 0, opacity: 1, duration: 0.7 }, 0)
      .to(q(".h-frame"), { y: 0, opacity: 1, duration: 1.2, stagger: 0.14, ease: "power3.out" }, 0.15)
      .to(q(".h-sub"), { y: 0, opacity: 1, duration: 0.8 }, 0.55)
      .to(q(".h-ctas"), { y: 0, opacity: 1, duration: 0.8 }, 0.75)
      .to(q(".h-note"), { y: 0, opacity: 1, duration: 0.8 }, 0.9)
      .to(q(".h-strip"), { y: 0, opacity: 1, duration: 0.8 }, 1.0);

    // scroll parallax — frames drift at different depths
    q(".h-parallax").forEach((node) => {
      const spd = parseFloat((node as HTMLElement).dataset.speed || "1");
      gsap.to(node, {
        y: () => spd * -110,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    });

    // pointer tilt (desktop)
    if (!isTouch()) {
      const cluster = q(".h-cluster")[0] as HTMLElement | undefined;
      if (cluster) {
        gsap.set(cluster, { transformPerspective: 1100 });
        const rX = gsap.quickTo(cluster, "rotationY", { duration: 0.9, ease: "power3.out" });
        const rY = gsap.quickTo(cluster, "rotationX", { duration: 0.9, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          rX(((e.clientX - r.left) / r.width - 0.5) * 6);
          rY(-((e.clientY - r.top) / r.height - 0.5) * 4);
        };
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      }
    }
  }, [t]);

  // featured product photos for the tap-through strip under the hero frames
  const spotItems = products.slice(0, 10).map((p) => {
    const img = primaryImage(p.slug, images.filter((i) => i.product_id === p.id));
    return { slug: p.slug, name: p.name[lang] || p.name.en || p.slug, src: img.src };
  });

  const scrollToShop = (e: React.MouseEvent) => {
    e.preventDefault();
    const s = document.querySelector("#shop") as HTMLElement | null;
    const lenis = (
      window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }
    ).lenis;
    if (lenis && s) lenis.scrollTo(s, { offset: -64 });
    else s?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 md:pt-36 lg:min-h-[100svh] lg:pt-0">
      {/* ambient glows */}
      <div aria-hidden className="absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden className="absolute -left-40 top-1/3 h-[380px] w-[380px] rounded-full bg-gold-light/[0.07] blur-3xl" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 pb-24 md:px-10 lg:min-h-[100svh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-0">
        {/* copy */}
        <div className="pt-4 lg:pt-0">
          <p className="h-badge mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/[0.04] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-light md:text-[11px]">
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            {t.hero.badge}
          </p>

          <h1 className="max-w-[12ch] font-serif text-[12.5vw] leading-[1.03] tracking-[-0.01em] text-ivory sm:text-6xl md:text-7xl lg:text-[5vw]">
            <RevealText text={t.hero.h1a} className="block" delay={2.5} />
            <span className="block">
              <em className="italic text-gold-light">
                <RevealText text={t.hero.h1em} delay={2.62} />
              </em>{" "}
              <RevealText text={t.hero.h1b} delay={2.7} />
            </span>
          </h1>

          <p className="h-sub mt-6 max-w-md text-[15px] leading-7 text-ivory/65 md:text-base md:leading-8">
            {t.hero.sub}
          </p>

          <div className="h-ctas mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                data-magnet
                href={SHOP.whatsapp}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
              >
                {t.hero.cta1}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                data-magnet
                href="#shop"
                onClick={scrollToShop}
                data-cursor="link"
                className="inline-flex items-center gap-3 rounded-full border border-ivory/25 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:text-gold-light"
              >
                {t.hero.cta2}
              </a>
            </Magnetic>
          </div>

          <p className="h-note mt-8 flex items-center gap-2.5 text-xs font-medium text-ivory/50">
            <span className="tracking-[0.15em] text-gold">★★★★★</span>
            <a
              href={SHOP.justdial}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="underline-offset-4 transition-colors hover:text-gold-light hover:underline"
            >
              {t.hero.rating}
            </a>
          </p>
        </div>

        {/* gallery wall (ambient product slideshow behind frames) + tappable featured strip under them */}
        <div className="lg:flex lg:h-[86vh] lg:max-h-[820px] lg:w-full lg:flex-col">
          <div className="h-cluster relative flex items-end justify-center lg:w-full lg:flex-1">
            {/* featured-product slide show behind the frames (was black) */}
            {wallImages.length > 0 && <WallSlider images={wallImages} />}
          {FRAMES.map((f, i) => (
            <div key={f.src} className={`h-parallax relative ${f.cls}`} data-speed={f.speed}>
              <FramedImage
                src={f.src}
                alt={f.alt}
                tone={f.tone}
                className="h-frame"
                priority={i === 0}
                strokes={false}
                aspect="aspect-[4/5]"
                sizes="(max-width: 1024px) 42vw, 30vw"
              />
            </div>
          ))}
          </div>
          {spotItems.length > 1 && (
            <div className="mt-12 lg:mt-0 lg:pb-2 lg:pt-8">
              <HeroSpotlight items={spotItems} kicker={t.featured.kicker} />
            </div>
          )}
        </div>
      </div>

      {/* scroll cue */}
      <div aria-hidden className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span className="text-[9px] uppercase tracking-[0.35em] text-ivory/40">{t.hero.scroll}</span>
        <span className="relative h-12 w-px overflow-hidden bg-ivory/15">
          <span className="absolute inset-x-0 h-full bg-gold animate-cue-line" />
        </span>
      </div>
    </section>
  );
}
