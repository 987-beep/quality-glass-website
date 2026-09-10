"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";
import RevealText from "@/components/fx/reveal-text";

const HASHES = ["/", "/shop", "/about", "/contact", "/faq"];
const LINK_LABELS = {
  en: ["Home", "Shop", "About Us", "Contact", "FAQ"],
  hi: ["होम", "शॉप", "हमारे बारे में", "संपर्क", "FAQ"],
};

export default function Footer() {
  const { t, lang } = useLanguage();
  const [openAccord, setOpenAccord] = useState<number | null>(null);

  const links = LINK_LABELS[lang] || LINK_LABELS.en;

  const goTo = (h: string) => (e: React.MouseEvent) => {
    if (h.startsWith("/")) return; // let Link handle it
    e.preventDefault();
    const lenis = (
      window as unknown as { lenis?: { scrollTo: (t: HTMLElement | number, o?: object) => void } }
    ).lenis;
    if (h === "/") {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(h) as HTMLElement | null;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const columns = [
    {
      title: { en: "Visit the Shop", hi: "दुकान का पता" },
      content: (
        <>
          <address className="text-sm not-italic leading-7 text-ivory/65">
            {SHOP.addressLines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
            <span className="mt-2 block text-ivory/40">{SHOP.hours}</span>
          </address>
          <a
            href={SHOP.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-gold-light"
          >
            {lang === "hi" ? "रास्ता देखें" : "Get directions"}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </>
      ),
    },
    {
      title: { en: "Explore", hi: "एक्सप्लोर" },
      content: (
        <ul className="space-y-2.5 text-sm text-ivory/65">
          {links.map((l, i) => (
            <li key={l + i}>
              <a
                href={HASHES[i]}
                onClick={goTo(HASHES[i])}
                className="transition-colors hover:text-gold-light"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: { en: "Contact", hi: "संपर्क" },
      content: (
        <ul className="space-y-2.5 text-sm text-ivory/65">
          <li>
            <a href={SHOP.phoneHref} className="transition-colors hover:text-gold-light">
              {SHOP.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-light">
              WhatsApp
            </a>
          </li>
          <li>
            <a href={SHOP.justdial} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-light">
              Justdial · {SHOP.rating} ★
            </a>
          </li>
        </ul>
      ),
    },
  ];

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

        {/* Columns — Desktop Grid / Mobile Accordion */}
        <div className="mt-12 border-t border-ivory/10 pt-10">
          {/* Desktop */}
          <div className="hidden gap-6 md:grid md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title.en}>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                  {col.title[lang] || col.title.en}
                </h3>
                {col.content}
              </div>
            ))}
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden">
            {columns.map((col, i) => (
              <div key={col.title.en} className="border-b border-ivory/10">
                <button
                  onClick={() => setOpenAccord(openAccord === i ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                    {col.title[lang] || col.title.en}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 text-gold transition-transform duration-300 ${openAccord === i ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 ${openAccord === i ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                  {col.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social & Payment */}
        <div className="mt-10 flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 transition-all hover:border-green-500 hover:text-green-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
            <a href="https://www.instagram.com/qualityglass_raebareli" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 transition-all hover:border-pink-500 hover:text-pink-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href={SHOP.justdial} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 transition-all hover:border-gold hover:text-gold">
              <span className="text-xs font-bold">JD</span>
            </a>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-2 text-[10px] text-ivory/30">
            <span className="rounded border border-ivory/10 px-2 py-1">UPI</span>
            <span className="rounded border border-ivory/10 px-2 py-1">GPay</span>
            <span className="rounded border border-ivory/10 px-2 py-1">PhonePe</span>
            <span className="rounded border border-ivory/10 px-2 py-1">Paytm</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-ivory/10 pt-6 text-[11px] text-ivory/35 md:flex-row">
          <p>{t.footer.rights}</p>
          <div className="flex gap-4">
            <a href="/about" className="transition-colors hover:text-gold-light">About</a>
            <a href="/contact" className="transition-colors hover:text-gold-light">Contact</a>
            <a href="/faq" className="transition-colors hover:text-gold-light">FAQ</a>
          </div>
        </div>
      </div>

      {/* Developer credit bar */}
      <div className="relative mt-10 border-t border-gold/20 bg-gradient-to-r from-transparent via-gold/[0.06] to-transparent">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-6 md:flex-row md:px-10">
          <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
            <p className="text-[9px] uppercase tracking-[0.4em] text-ivory/40">Designed &amp; Developed by</p>
            <p className="font-serif text-xl leading-none text-gold">
              Vishishth Gaur<span className="mx-2 italic text-ivory/35">·</span><span className="tracking-[0.25em]">KAATYA</span>
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] md:gap-5">
            <a href="https://www.instagram.com/_kaatya_og_" target="_blank" rel="noreferrer" className="group flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-ivory/60 transition-all hover:border-gold/50 hover:text-gold">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              @_kaatya_og_
            </a>
            <a href="mailto:vishishthgaurlittle@gmail.com" className="group flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-ivory/60 transition-all hover:border-gold/50 hover:text-gold">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></svg>
              <span className="hidden sm:inline">vishishthgaurlittle@gmail.com</span>
              <span className="sm:hidden">Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
