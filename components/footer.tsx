"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";
import RevealText from "@/components/fx/reveal-text";

const HASHES = ["#top", "#shop", "#studio", "#reviews", "#contact"];

export default function Footer() {
  const { t } = useLanguage();

  const goTo = (h: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const lenis = (
      window as unknown as {
        lenis?: { scrollTo: (t: HTMLElement | number, o?: object) => void };
      }
    ).lenis;
    if (h === "#top") {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(h) as HTMLElement | null;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-gold/10 bg-[#080605] pt-20 text-ivory/80 md:pt-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <RevealText
          as="h2"
          text={t.footer.word}
          className="block font-serif text-[15vw] leading-[0.95] text-ivory md:text-[9.5vw]"
        />
        <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-gold md:text-xs">
          {t.footer.tag}
        </p>

        <div className="mt-12 grid gap-10 border-t border-ivory/10 pt-10 md:grid-cols-3 md:gap-6">
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
              {t.footer.visit}
            </h3>
            <address className="text-sm not-italic leading-7 text-ivory/65">
              {SHOP.addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
              <span className="mt-2 block text-ivory/40">{SHOP.hours}</span>
            </address>
            <a
              href={SHOP.mapsUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="mt-4 inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-gold-light"
            >
              {t.cta.directions}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
              {t.footer.explore}
            </h3>
            <ul className="space-y-2.5 text-sm text-ivory/65">
              {t.nav.links.map((l, i) => (
                <li key={l + i}>
                  <a
                    href={HASHES[i]}
                    onClick={goTo(HASHES[i])}
                    data-cursor="link"
                    className="transition-colors hover:text-gold-light"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
              {t.footer.contact}
            </h3>
            <ul className="space-y-2.5 text-sm text-ivory/65">
              <li>
                <a href={SHOP.phoneHref} data-cursor="link" className="transition-colors hover:text-gold-light">
                  {SHOP.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" data-cursor="link" className="transition-colors hover:text-gold-light">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={SHOP.justdial} target="_blank" rel="noreferrer" data-cursor="link" className="transition-colors hover:text-gold-light">
                  Justdial · {SHOP.rating} ★
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ivory/10 pt-6 text-[11px] text-ivory/35 md:flex-row">
          <p>{t.footer.rights}</p>
          <p>{t.footer.made} ✦</p>
        </div>
      </div>

      {/* ── Developer credit bar ────────────────────────────── */}
      <div className="relative mt-10 border-t border-gold/20 bg-gradient-to-r from-transparent via-gold/[0.06] to-transparent">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-6 md:flex-row md:px-10">
          <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
            <p className="text-[9px] uppercase tracking-[0.4em] text-ivory/40">
              Designed &amp; Developed by
            </p>
            <p className="font-serif text-xl leading-none text-gold">
              Vishishth Gaur
              <span className="mx-2 italic text-ivory/35">·</span>
              <span className="tracking-[0.25em]">KAATYA</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] md:gap-5">
            <a
              href="https://www.instagram.com/_kaatya_og_"
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="group flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-ivory/60 transition-all hover:border-gold/50 hover:text-gold"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @_kaatya_og_
            </a>
            <a
              href="mailto:vishishthgaurlittle@gmail.com"
              data-cursor="link"
              className="group flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-ivory/60 transition-all hover:border-gold/50 hover:text-gold"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
              <span className="hidden sm:inline">vishishthgaurlittle@gmail.com</span>
              <span className="sm:hidden">Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
