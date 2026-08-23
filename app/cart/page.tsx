"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { formatINR } from "@/lib/format";
import { TONE_FRAME } from "@/components/shop/product-card";

export default function CartPage() {
  const cart = useCart();
  const { t } = useLanguage();

  return (
    <main className="relative min-h-[100svh] overflow-hidden pb-28 pt-28 md:pt-36">
      <div aria-hidden className="absolute -top-24 right-10 h-[360px] w-[360px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1000px] px-5 md:px-10">
        <h1 className="font-serif text-4xl text-ivory md:text-6xl">{t.cart.title}</h1>

        {!cart.ready ? null : cart.items.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-gold/25 bg-gold/[0.04] p-10 text-center md:p-16">
            <p className="font-serif text-2xl text-ivory">{t.cart.empty}</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ivory/50">
              {t.cart.emptySub}
            </p>
            <Link
              href="/shop"
              data-cursor="link"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
            >
              {t.cart.shopNow}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            {/* items */}
            <div className="space-y-5">
              {cart.items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 rounded-2xl border border-ivory/10 bg-white/[0.02] p-4 md:gap-5 md:p-5"
                >
                  <Link href={`/product/${item.slug}`} className="shrink-0">
                    <span className={`${TONE_FRAME[item.tone] ?? "gold-frame"} block rounded-[2px] p-[5px] shadow-frame`}>
                      <span className="relative block h-[72px] w-[58px] overflow-hidden bg-mat md:h-[88px] md:w-[70px]">
                        <span className="absolute inset-1 overflow-hidden bg-ink">
                          <Image src={item.image} alt={item.name} fill sizes="70px" className="object-cover" />
                        </span>
                      </span>
                    </span>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-base text-ivory md:text-lg">
                          {item.name}
                        </h3>
                        {item.options.length > 0 && (
                          <p className="mt-1 line-clamp-1 text-[11px] text-ivory/40">
                            {item.options.map((o) => o.label).join(" · ")}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-serif text-base text-gold-light md:text-lg">
                        {formatINR(item.unitPrice * item.qty)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-ivory/15 p-0.5">
                        <button
                          onClick={() => cart.setQty(item.key, item.qty - 1)}
                          data-cursor="link"
                          aria-label="decrease"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-white/5 hover:text-gold-light"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm text-ivory">{item.qty}</span>
                        <button
                          onClick={() => cart.setQty(item.key, item.qty + 1)}
                          data-cursor="link"
                          aria-label="increase"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-white/5 hover:text-gold-light"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => cart.remove(item.key)}
                        data-cursor="link"
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/35 transition-colors hover:text-red-300"
                      >
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <aside className="h-fit rounded-2xl border border-gold/20 bg-ink-2 p-6 shadow-frame md:p-8 lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ivory/60">{t.cart.subtotal}</p>
                <p className="font-serif text-3xl text-gold-light">{formatINR(cart.subtotal)}</p>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-ivory/40">{t.cart.note}</p>
              <Link
                href="/checkout"
                data-cursor="link"
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
              >
                {t.cart.checkout}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/shop"
                data-cursor="link"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-ivory/15 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
              >
                {t.cart.continue}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
