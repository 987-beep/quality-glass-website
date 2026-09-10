"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Shot = { src: string; alt: string };

const TONE_FRAME: Record<string, string> = {
  gold: "gold-frame",
  wood: "wood-frame",
  black: "black-frame",
};

export default function ProductGallery({
  shots,
  tone = "gold",
  framed = true,
}: {
  shots: Shot[];
  tone?: string;
  framed?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [lbScale, setLbScale] = useState(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pinchDist = useRef<number | null>(null);

  const list = shots.length ? shots : [{ src: "/images/cat-historical.jpg", alt: "product" }];
  const active = list[Math.min(idx, list.length - 1)];
  const frameCls = TONE_FRAME[tone] ?? "gold-frame";

  const next = useCallback(() => setIdx((i) => (i + 1) % list.length), [list.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + list.length) % list.length), [list.length]);

  // keyboard nav in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightbox(false); setLbScale(1); }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, next, prev]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  // swipe / pinch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinchDist.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setLbScale(Math.min(4, Math.max(1, (d / pinchDist.current) * lbScale)));
      pinchDist.current = d;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    pinchDist.current = null;
    if (!touchStart.current || lbScale > 1.05) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    touchStart.current = null;
  };

  return (
    <>
      <div className="mx-auto max-w-[520px]">
        {/* main image */}
        <div
          className={framed ? `${frameCls} rounded-[3px] p-[10px] shadow-frame md:p-[14px]` : "overflow-hidden rounded-2xl border border-gold/15 bg-ink-2 shadow-frame"}
        >
          <div
            className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden border border-gold/10 bg-mat"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={onMove}
            onClick={() => setLightbox(true)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="button"
            tabIndex={0}
            aria-label="Open full screen"
            onKeyDown={(e) => e.key === "Enter" && setLightbox(true)}
          >
            <div className={framed ? "absolute inset-[10px] overflow-hidden bg-ink md:inset-4" : "absolute inset-0 overflow-hidden bg-ink"}>
              {list.map((s, i) => (
                <Image
                  key={s.src + i}
                  src={s.src}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width:1024px) 92vw, 520px"
                  className="object-cover transition-all duration-500 ease-out"
                  style={{
                    opacity: i === idx ? 1 : 0,
                    transform: i === idx && zoom ? "scale(2)" : "scale(1)",
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                    transitionDuration: zoom ? "180ms" : "500ms",
                  }}
                />
              ))}

              {/* magnifier hint */}
              <div className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-gold opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
                </svg>
              </div>
            </div>

            {/* arrows */}
            {list.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-ivory/80 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-ink group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-ivory/80 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-ink group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* thumbnails */}
        {list.length > 1 && (
          <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {list.map((s, i) => (
              <button
                key={s.src + i}
                onClick={() => setIdx(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 md:h-20 md:w-20 ${
                  i === idx ? "border-gold shadow-glowgold" : "border-ivory/12 opacity-55 hover:opacity-100"
                }`}
              >
                <Image src={s.src} alt={s.alt} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* dots (mobile) */}
        {list.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {list.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-5 bg-gold" : "w-1.5 bg-ivory/25"}`} />
            ))}
          </div>
        )}
      </div>

      {/* lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/96 backdrop-blur-md"
          style={{ animation: "fadeIn 250ms ease-out" }}
          onClick={() => { setLightbox(false); setLbScale(1); }}
        >
          <button
            onClick={() => { setLightbox(false); setLbScale(1); }}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-all hover:border-gold hover:text-gold md:right-8 md:top-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>

          <p className="absolute left-1/2 top-6 -translate-x-1/2 text-[11px] uppercase tracking-[0.25em] text-ivory/40">
            {idx + 1} / {list.length}
          </p>

          <div
            className="relative flex h-full w-full items-center justify-center p-6 md:p-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.alt}
              onDoubleClick={() => setLbScale((s) => (s > 1 ? 1 : 2.2))}
              className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl transition-transform duration-300"
              style={{ transform: `scale(${lbScale})` }}
            />
          </div>

          {list.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); setLbScale(1); }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-all hover:border-gold hover:text-gold md:left-8"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); setLbScale(1); }}
                aria-label="Next"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-all hover:border-gold hover:text-gold md:right-8"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {list.map((s, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); setLbScale(1); }}
                className={`relative h-12 w-12 overflow-hidden rounded border transition-all ${i === idx ? "border-gold" : "border-ivory/15 opacity-50"}`}
              >
                <Image src={s.src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
