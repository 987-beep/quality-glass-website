"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { useGsap, gsap } from "@/components/fx/use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";
import ProductCard from "@/components/shop/product-card";
import { primaryImage } from "@/lib/product-media";
import { SHOP } from "@/lib/site-config";
import type { Category, Product, ProductImage } from "@/lib/server/catalog";

export default function ShopClient({
  categories,
  products,
  images,
  initialCategory,
}: {
  categories: Category[];
  products: Product[];
  images: ProductImage[];
  initialCategory: string;
}) {
  const { lang, t } = useLanguage();
  const [cat, setCat] = useState(initialCategory);

  const imageByProduct = useMemo(() => {
    const m = new Map<string, ProductImage[]>();
    for (const img of images) {
      const list = m.get(img.product_id) ?? [];
      list.push(img);
      m.set(img.product_id, list);
    }
    return m;
  }, [images]);

  const filtered = useMemo(
    () =>
      cat === "all"
        ? products
        : products.filter(
            (p) => categories.find((c) => c.id === p.category_id)?.slug === cat
          ),
    [cat, products, categories]
  );

  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;
    gsap.set(q(".sh-in"), { y: 30, opacity: 0 });
    gsap.to(q(".sh-in"), {
      y: 0,
      opacity: 1,
      duration: 0.85,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.1,
    });
  }, []);

  const gridRef = useGsap((el, q) => {
    if (prefersReduced()) return;
    const cards = q(".shop-card");
    gsap.set(cards, { y: 34, opacity: 0 });
    gsap.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.05,
      ease: "power3.out",
    });
  }, [cat]);

  const chipBase =
    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300";

  return (
    <main ref={ref} className="relative min-h-[100svh] overflow-hidden pb-28 pt-28 md:pt-36">
      {/* ambience */}
      <div aria-hidden className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div aria-hidden className="absolute bottom-40 -left-32 h-[360px] w-[360px] rounded-full bg-gold-light/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        {/* header */}
        <p className="sh-in text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
          {t.shopPage.kicker} · {SHOP.estd}–2026
        </p>
        <h1 className="sh-in mt-4 font-serif text-5xl leading-[1.02] text-ivory md:text-7xl">
          {t.shopPage.title}{" "}
          <em className="italic text-gold-light">{t.shopPage.titleEm}</em>
        </h1>
        <p className="sh-in mt-5 max-w-xl text-sm leading-6 text-ivory/55 md:text-base md:leading-7">
          {t.shopPage.sub}
        </p>
        <p className="sh-in mt-3 text-[10px] uppercase tracking-[0.24em] text-ivory/30">
          {t.shopPage.close}
        </p>

        {/* filters */}
        <div className="sh-in mt-10 flex flex-wrap items-center gap-2.5 md:mt-12">
          {[{ slug: "all", name: { en: t.shopPage.all } as Category["name"] }, ...categories].map(
            (c) => {
              const label =
                c.slug === "all" ? t.shopPage.all : c.name[lang] || c.name.en || c.slug;
              const active = cat === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setCat(c.slug)}
                  data-cursor="link"
                  className={`${chipBase} ${
                    active
                      ? "border-gold bg-gold text-ink shadow-glowgold"
                      : "border-ivory/15 text-ivory/60 hover:border-gold/60 hover:text-gold-light"
                  }`}
                >
                  {label}
                </button>
              );
            }
          )}
          <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-ivory/35">
            {filtered.length} {t.shopPage.pieces}
          </span>
        </div>

        {/* grid */}
        <div
          ref={gridRef}
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:gap-x-7 md:gap-y-16 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              image={primaryImage(p.slug, imageByProduct.get(p.id))}
              eager={i < 4}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-gold/30 bg-gold/[0.05] p-10 text-center text-sm leading-6 text-ivory/55">
              {t.shopPage.empty}
            </p>
          )}
        </div>

        {/* custom framing CTA */}
        <div className="mt-24 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-ink-2 via-ink to-ink-2 p-8 shadow-frame md:mt-32 md:p-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
                {t.shopPage.kicker}
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-ivory md:text-5xl">
                {t.shopPage.customTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ivory/55 md:text-base">
                {t.shopPage.customSub}
              </p>
            </div>
            <Link
              href={SHOP.whatsapp}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
            >
              {t.shopPage.customCta}
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
