"use client";

import { useGsap, gsap } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import RevealText from "@/components/fx/reveal-text";
import Magnetic from "@/components/fx/magnetic";
import { SHOP } from "@/lib/site-config";
import { prefersReduced } from "@/lib/fx-helpers";

export default function Cta() {
  const { t } = useLanguage();

  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;
    gsap.to(q(".cta-word"), {
      xPercent: -10,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.set(q(".cta-card"), { y: 70, opacity: 0 });
    gsap.to(q(".cta-card"), {
      y: 0,
      opacity: 1,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 62%", once: true },
    });
  }, [t]);

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden bg-gradient-to-b from-ink to-[#171207] py-24 md:py-36">
      <div
        aria-hidden
        className="cta-word pointer-events-none absolute -left-10 top-6 select-none whitespace-nowrap font-serif text-[24vw] leading-none outline-word"
      >
        FRAMES&nbsp;FRAMES
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <RevealText
              as="h2"
              text={t.cta.title}
              className="max-w-[16ch] font-serif text-4xl leading-[1.08] text-ivory md:text-6xl"
            />
            <p className="mt-6 max-w-md text-[15px] leading-7 text-ivory/60 md:text-base md:leading-8">
              {t.cta.sub}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Magnetic>
                <a
                  data-magnet
                  href={SHOP.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="link"
                  className="inline-flex items-center gap-3 rounded-full bg-leaf px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  {t.cta.whatsapp}
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  data-magnet
                  href={SHOP.phoneHref}
                  data-cursor="link"
                  className="inline-flex items-center gap-3 rounded-full border border-gold/50 px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-gold-light transition-colors hover:bg-gold hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  {t.cta.call}
                </a>
              </Magnetic>
            </div>

            <p className="mt-6 flex items-center gap-2.5 text-xs text-ivory/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full rounded-full bg-leaf opacity-75 animate-ping" />
                <span className="relative h-2 w-2 rounded-full bg-leaf" />
              </span>
              {t.cta.openNote} · {t.cta.reply}
            </p>
          </div>

          {/* framed address card */}
          <div className="cta-card mx-auto w-full max-w-md">
            <div className="gold-frame rounded-[2px] p-[10px] shadow-frame">
              <div className="border border-gold/15 bg-ink-2 p-7 md:p-9">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                  {SHOP.unit}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-ivory md:text-[1.7rem]">
                  {SHOP.name}
                </h3>
                <div className="mt-6 space-y-1.5 text-sm leading-6 text-ivory/65">
                  {SHOP.addressLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-ivory/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                  {SHOP.hours}
                </p>

                {/* listing #8: embedded Google Map — near Hotel Ganesh, PNT Colony */}
                <div className="mt-5 overflow-hidden rounded-xl border border-gold/20">
                  <iframe
                    title="Quality Glass Emporium & Photo Framing Center — map"
                    src="https://www.google.com/maps?q=Quality+Glass+Emporium+Photo+Framing+Center+PNT+Colony+Raebareli&output=embed"
                    className="h-44 w-full grayscale-[35%] contrast-[1.05]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={SHOP.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
                  >
                    {t.cta.directions}
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                  <a
                    href={SHOP.phoneHref}
                    data-cursor="link"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ivory/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ivory/80 transition-colors hover:border-gold hover:text-gold-light"
                  >
                    {SHOP.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
