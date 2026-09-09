"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { useGsap, gsap } from "@/components/fx/use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";
import ProductCard from "@/components/shop/product-card";
import RecentlyViewed from "@/components/shop/recently-viewed";
import {
  SearchBar,
  SortSelect,
  PriceRange,
  CategoryList,
  FILTER_COPY,
  pushRecentSearch,
  type SortKey,
} from "@/components/shop/shop-filters";
import { primaryImage } from "@/lib/product-media";
import { priceOf } from "@/lib/server/catalog";
import { formatINR } from "@/lib/format";
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
  const c = FILTER_COPY[lang as "en" | "hi"] || FILTER_COPY.en;

  // price bounds from catalog
  const [floor, ceil] = useMemo(() => {
    const prices = products.map((p) => priceOf(p));
    if (!prices.length) return [0, 5000] as [number, number];
    const lo = Math.floor(Math.min(...prices) / 50) * 50;
    const hi = Math.ceil(Math.max(...prices) / 50) * 50;
    return [lo, hi === lo ? lo + 500 : hi] as [number, number];
  }, [products]);

  const [cat, setCat] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [range, setRange] = useState<[number, number]>([floor, ceil]);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setRange([floor, ceil]), [floor, ceil]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const imageByProduct = useMemo(() => {
    const m = new Map<string, ProductImage[]>();
    for (const img of images) {
      const list = m.get(img.product_id) ?? [];
      list.push(img);
      m.set(img.product_id, list);
    }
    return m;
  }, [images]);

  const catSlugOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) m.set(p.id, categories.find((x) => x.id === p.category_id)?.slug ?? "");
    return m;
  }, [products, categories]);

  const nameOf = (p: Product) => p.name[lang as "en" | "hi"] || p.name.en || p.slug;

  // counts per category
  const counts = useMemo(() => {
    const o: Record<string, number> = { __all: products.length };
    for (const p of products) {
      const s = catSlugOf.get(p.id) ?? "";
      o[s] = (o[s] ?? 0) + 1;
    }
    return o;
  }, [products, catSlugOf]);

  // filtering + sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = products.filter((p) => {
      if (cat !== "all" && catSlugOf.get(p.id) !== cat) return false;
      const price = priceOf(p);
      if (price < range[0] || price > range[1]) return false;
      if (q) {
        const hay = `${p.name.en ?? ""} ${p.name.hi ?? ""} ${p.description?.en ?? ""} ${p.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    out = [...out].sort((a, b) => {
      switch (sort) {
        case "price-asc": return priceOf(a) - priceOf(b);
        case "price-desc": return priceOf(b) - priceOf(a);
        case "name-asc": return String(nameOf(a)).localeCompare(String(nameOf(b)));
        case "newest": return String(b.id).localeCompare(String(a.id));
        default: return Number(b.is_featured) - Number(a.is_featured);
      }
    });
    return out;
  }, [products, cat, query, range, sort, catSlugOf, lang]);

  // autocomplete
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => `${p.name.en ?? ""} ${p.name.hi ?? ""} ${p.slug}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({ slug: p.slug, label: String(nameOf(p)) }));
  }, [query, products, lang]);

  // active filter chips
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (cat !== "all") {
    const label = categories.find((x) => x.slug === cat);
    chips.push({
      key: "cat",
      label: (label?.name[lang as "en" | "hi"] || label?.name.en || cat) as string,
      clear: () => setCat("all"),
    });
  }
  if (query.trim()) chips.push({ key: "q", label: `"${query.trim()}"`, clear: () => setQuery("") });
  if (range[0] !== floor || range[1] !== ceil)
    chips.push({ key: "price", label: `${formatINR(range[0])} – ${formatINR(range[1])}`, clear: () => setRange([floor, ceil]) });

  const clearAll = () => { setCat("all"); setQuery(""); setRange([floor, ceil]); setSort("featured"); };

  const ref = useGsap(() => {}, []);
  const gridRef = useGsap((el, q) => {
    if (prefersReduced()) return;
    const cards = q(".shop-card");
    gsap.set(cards, { y: 30, opacity: 0 });
    gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: "power3.out" });
  }, [cat, query, sort, range[0], range[1]]);

  const sidebar = (
    <div className="space-y-9">
      <CategoryList categories={categories} active={cat} onSelect={(s) => { setCat(s); setDrawer(false); }} counts={counts} />
      <div className="h-px bg-ivory/8" />
      <PriceRange min={floor} max={ceil} value={range} onChange={setRange} />
      <div className="h-px bg-ivory/8" />
      <button
        onClick={clearAll}
        className="w-full rounded-full border border-ivory/15 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/55 transition-all hover:border-gold/50 hover:text-gold-light"
      >
        {c.clear}
      </button>
    </div>
  );

  return (
    <main ref={ref} className="relative min-h-[100svh] overflow-hidden pb-28 pt-28 md:pt-36">
      <div aria-hidden className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div aria-hidden className="absolute bottom-40 -left-32 h-[360px] w-[360px] rounded-full bg-gold-light/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        {/* header */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
          {t.shopPage.kicker} · {SHOP.estd}–2026
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ivory md:text-7xl">
          {t.shopPage.title} <em className="italic text-gold-light">{t.shopPage.titleEm}</em>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-ivory/55 md:text-base md:leading-7">{t.shopPage.sub}</p>

        {/* bulk strip */}
        <a
          href="/bulk"
          data-cursor="link"
          className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-5 py-4 transition-colors hover:border-gold/60 hover:bg-gold/[0.1] md:max-w-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📦</span>
            <div>
              <p className="text-sm font-semibold text-gold-light">Wedding, school function, award ceremony?</p>
              <p className="mt-0.5 text-[11px] text-ivory/50">Bulk / event orders get special pricing — enquiry in 1 minute →</p>
            </div>
          </div>
          <span className="text-gold-light">→</span>
        </a>

        {/* toolbar */}
        <div className="mt-10 flex flex-wrap items-center gap-3 md:mt-12">
          <button
            onClick={() => setDrawer(true)}
            className="flex shrink-0 items-center gap-2.5 rounded-full border border-ivory/15 px-4 py-3 text-xs font-semibold text-ivory/65 transition-all hover:border-gold/50 hover:text-gold-light lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {c.filters}
            {chips.length > 0 && <span className="rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink">{chips.length}</span>}
          </button>

          <SearchBar value={query} onChange={setQuery} suggestions={suggestions} onPick={(l) => { setQuery(l); pushRecentSearch(l); }} />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-ivory/35 sm:inline">
              {filtered.length} {t.shopPage.pieces}
            </span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        {/* chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((ch) => (
              <span
                key={ch.key}
                className="group flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.08] py-1.5 pl-3.5 pr-2 text-xs text-gold-light"
                style={{ animation: "chipIn 280ms cubic-bezier(0.34,1.56,0.64,1)" }}
              >
                {ch.label}
                <button
                  onClick={ch.clear}
                  aria-label={`Remove ${ch.label} filter`}
                  className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-gold hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="ml-1 text-[10px] uppercase tracking-[0.18em] text-ivory/35 transition-colors hover:text-gold-light">
              {c.clear}
            </button>
          </div>
        )}

        {/* body: sidebar + grid */}
        <div className="mt-9 gap-10 lg:grid lg:grid-cols-[230px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28">{sidebar}</div>
          </aside>

          <div>
            <div ref={gridRef} className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-7 md:gap-y-16 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} image={primaryImage(p.slug, imageByProduct.get(p.id))} eager={i < 4} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gold/30 bg-gold/[0.04] p-12 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-4 font-serif text-2xl text-ivory">
                  {lang === "hi" ? "कुछ नहीं मिला" : "Nothing matches that"}
                </p>
                <p className="mt-2 text-sm text-ivory/50">{t.shopPage.empty}</p>
                <button
                  onClick={clearAll}
                  className="mt-6 rounded-full bg-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
                >
                  {c.clear}
                </button>
              </div>
            )}
          </div>
        </div>

        <RecentlyViewed />

        {/* custom framing CTA */}
        <div className="mt-24 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-ink-2 via-ink to-ink-2 p-8 shadow-frame md:mt-32 md:p-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">{t.shopPage.kicker}</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-ivory md:text-5xl">{t.shopPage.customTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ivory/55 md:text-base">{t.shopPage.customSub}</p>
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

      {/* mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            style={{ animation: "fadeIn 200ms ease-out" }}
            onClick={() => setDrawer(false)}
          />
          <div
            className="absolute inset-y-0 left-0 w-[86%] max-w-[340px] overflow-y-auto border-r border-gold/20 bg-ink-2 p-6 pt-8 shadow-2xl"
            style={{ animation: "slideInLeft 320ms cubic-bezier(0.16,1,0.3,1)" }}
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="font-serif text-2xl text-ivory">{c.filters}</p>
              <button
                onClick={() => setDrawer(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition-all hover:border-gold hover:text-gold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {sidebar}
            <button
              onClick={() => setDrawer(false)}
              className="mt-8 w-full rounded-full bg-gold py-4 text-xs font-bold uppercase tracking-[0.16em] text-ink shadow-glowgold"
            >
              {c.apply} ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
