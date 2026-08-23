"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/components/fx/use-gsap";
import { useLanguage } from "@/components/providers/language-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { SHOP } from "@/lib/site-config";

const HASHES = ["#top", "/shop", "#studio", "#reviews", "#contact"];

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const auth = useAuth();
  const { count: cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      navRef.current
    ) {
      gsap.fromTo(
        navRef.current,
        { yPercent: -120 },
        { yPercent: 0, duration: 0.9, ease: "power3.out", delay: 2.4 }
      );
    }
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (!navRef.current) return;
      if (y > lastY.current && y > 160 && !open) {
        gsap.to(navRef.current, { yPercent: -110, duration: 0.4, ease: "power3.out" });
      } else {
        gsap.to(navRef.current, { yPercent: 0, duration: 0.4, ease: "power3.out" });
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const lenis = (
      window as unknown as { lenis?: { stop: () => void; start: () => void } }
    ).lenis;
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const goTo = (h: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
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
    <>
      <header
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-500 ${
          scrolled
            ? "border-b border-gold/10 bg-ink/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-10">
          {/* brand */}
          <a
            href="#top"
            onClick={goTo("#top")}
            className="group flex items-center gap-3"
            data-cursor="link"
            aria-label="Quality Glass — home"
          >
            <span className="gold-frame flex h-9 w-9 items-center justify-center rounded-[2px] shadow-frame md:h-10 md:w-10">
              <span className="flex h-[70%] w-[70%] items-end justify-center overflow-hidden bg-ink">
                <svg viewBox="0 0 20 20" className="h-full w-full">
                  <circle cx="6.5" cy="6" r="2.4" fill="#E8CF8F" />
                  <path d="M1 17 L8 7 L12.5 13.5 L15 10 L19 17 Z" fill="#C9A24B" />
                </svg>
              </span>
            </span>
            <span className="leading-tight">
              <span className={`block font-serif text-[15px] font-semibold tracking-wide transition-colors md:text-lg ${open ? "text-ivory" : "text-ivory"}`}>
                Quality Glass
              </span>
              <span className="block text-[8px] uppercase tracking-[0.28em] text-ivory/45 md:text-[9px]">
                Emporium · Raebareli
              </span>
            </span>
          </a>

          {/* desktop links */}
          <nav className="hidden items-center gap-8 lg:flex">
            {t.nav.links.map((l, i) => (
              <a
                key={l + i}
                href={HASHES[i]}
                onClick={goTo(HASHES[i])}
                data-cursor="link"
                className="group relative text-[12.5px] font-medium uppercase tracking-[0.16em] text-ivory/65 transition-colors hover:text-ivory"
              >
                {l}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* language toggle */}
            <div className="flex overflow-hidden rounded-full border border-gold/40 text-[11px] font-semibold tracking-wider">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  data-cursor="link"
                  aria-label={l === "en" ? "English" : "Hindi"}
                  className={`px-2.5 py-1.5 transition-colors ${
                    lang === l ? "bg-gold text-ink" : "text-ivory/55 hover:text-ivory"
                  }`}
                >
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>

            {!auth.loading && !auth.user && (
              <Link
                href="/login"
                data-cursor="link"
                className="hidden text-[12.5px] font-medium uppercase tracking-[0.16em] text-ivory/65 transition-colors hover:text-ivory lg:block"
              >
                Login
              </Link>
            )}
            <Link
              href="/cart"
              data-cursor="link"
              aria-label="Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/75 transition-colors hover:border-gold hover:text-gold-light"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </Link>
            {!auth.loading && auth.user && (
              <Link
                href={auth.isAdmin ? "/admin" : "/account"}
                data-cursor="link"
                aria-label="Your account"
                className="hidden h-8 w-8 items-center justify-center rounded-full bg-gold font-sans text-xs font-bold text-ink shadow-glowgold lg:flex"
              >
                {(auth.profile?.full_name || auth.user.email || "U")[0].toUpperCase()}
              </Link>
            )}
            <a
              href={SHOP.whatsapp}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="hidden rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light lg:block"
            >
              {t.nav.order}
            </a>

            {/* hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Menu"
              data-cursor="link"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[7px] lg:hidden"
            >
              <span
                className={`h-[2px] w-6 bg-ivory transition-all duration-300 ${
                  open ? "translate-y-[4.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[2px] w-6 bg-ivory transition-all duration-300 ${
                  open ? "-translate-y-[4.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[65] flex flex-col justify-between bg-[#110E08] px-7 pb-10 pt-28 transition-[clip-path] duration-700 ease-[cubic-bezier(0.83,0,0.17,1)] lg:hidden ${
          open
            ? "[clip-path:inset(0_0_0%_0)]"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {t.nav.links.map((l, i) => (
            <a
              key={l + i}
              href={HASHES[i]}
              onClick={goTo(HASHES[i])}
              className={`font-serif text-4xl text-ivory transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
            >
              {l}
            </a>
          ))}
        </nav>
        <div
          className={`flex flex-col gap-4 transition-all duration-500 ${
            open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: open ? "420ms" : "0ms" }}
        >
          <Link
            href={auth.user ? (auth.isAdmin ? "/admin" : "/account") : "/login"}
            onClick={() => setOpen(false)}
            className="w-full rounded-full border border-ivory/20 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-ivory/85"
          >
            {auth.user ? (auth.isAdmin ? "Owner Studio" : "My Account") : "Login / Sign up"}
          </Link>
          <a
            href={SHOP.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-full bg-gold px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-ink"
          >
            {t.nav.order}
          </a>
          <p className="text-center text-xs text-ivory/45">{SHOP.hours}</p>
        </div>
      </div>
    </>
  );
}
