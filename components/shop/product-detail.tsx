"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { useCart, type CartOption } from "@/components/providers/cart-provider";
import { useRouter } from "next/navigation";
import { useGsap, gsap } from "@/components/fx/use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";
import FramedImage from "@/components/fx/framed-image";
import ProductCard from "@/components/shop/product-card";
import { primaryImage } from "@/lib/product-media";
import { formatINR } from "@/lib/format";
import { priceOf } from "@/lib/server/catalog";
import type {
  FrameOption,
  Product,
  ProductImage,
} from "@/lib/server/catalog";
import { SHOP } from "@/lib/site-config";

const KIND_ORDER: Record<string, number> = { size: 0, glass: 1, moulding: 2, mat: 3 };

export default function ProductDetail({
  product,
  images,
  options,
  related,
  relatedImages,
}: {
  product: Product;
  images: ProductImage[];
  options: FrameOption[];
  related: Product[];
  relatedImages: Record<string, ProductImage[]>;
}) {
  const { lang, t } = useLanguage();
  const cart = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const name = product.name[lang] || product.name.en || product.slug;
  const desc = product.description?.[lang] || product.description?.en || "";
  const base = priceOf(product);
  const img = primaryImage(product.slug, images);

  const groups = useMemo(() => {
    const g = new Map<string, FrameOption[]>();
    for (const o of options) {
      const list = g.get(o.kind) ?? [];
      list.push(o);
      g.set(o.kind, list);
    }
    return Array.from(g.entries()).sort(
      (a, b) => (KIND_ORDER[a[0]] ?? 9) - (KIND_ORDER[b[0]] ?? 9)
    );
  }, [options]);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map(([kind, list]) => [kind, list[0]?.key ?? ""]))
  );
  const [qty, setQty] = useState(1);

  const unit = useMemo(() => {
    let total = base;
    for (const [kind, key] of Object.entries(selected)) {
      const opt = groups
        .find(([k]) => k === kind)?.[1]
        .find((o) => o.key === key);
      if (opt) total += Number(opt.price_delta);
    }
    return total;
  }, [base, selected, groups]);

  const total = unit * qty;

  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;
    gsap.set(q(".pd-in"), { y: 26, opacity: 0 });
    gsap.to(q(".pd-in"), {
      y: 0,
      opacity: 1,
      duration: 0.75,
      stagger: 0.07,
      ease: "power3.out",
      delay: 0.1,
    });
  }, []);

  const optionLabel = (o: FrameOption) => o.name[lang] || o.name.en || o.key;

  const orderText = useMemo(() => {
    const opts = Object.entries(selected)
      .map(([kind, key]) => {
        const o = groups.find(([k]) => k === kind)?.[1].find((x) => x.key === key);
        return o ? `${kind}: ${o.name.en ?? o.key}` : "";
      })
      .filter(Boolean)
      .join(", ");
    return encodeURIComponent(
      `Hi Quality Glass! I'd like to order:\n• ${product.name.en} × ${qty}\n• Options: ${opts}\n• Total: ${formatINR(total)}\n(Please confirm availability — from the website)`
    );
  }, [selected, qty, total, groups, product.name.en]);

  const kindTitle = (kind: string) =>
    (t.productPage as Record<string, string>)[kind] ?? kind;

  const addToCart = () => {
    const opts = Object.entries(selected)
      .map(([kind, key]): CartOption | null => {
        const o = groups
          .find(([k]) => k === kind)?.[1]
          .find((x) => x.key === key);
        return o
          ? {
              kind,
              key,
              label: optionLabel(o),
              delta: Number(o.price_delta),
            }
          : null;
      })
      .filter((o): o is CartOption => Boolean(o));
    cart.add(
      {
        product_id: product.id,
        slug: product.slug,
        name: String(name),
        image: img.src,
        tone: product.frame_tone ?? "gold",
        unitPrice: unit,
        options: opts,
      },
      qty
    );
    setAdded(true);
    router.prefetch?.("/cart");
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <main ref={ref} className="relative min-h-[100svh] overflow-hidden pb-24 pt-24 md:pt-32">
      <div aria-hidden className="absolute -top-20 left-1/3 h-[420px] w-[420px] rounded-full bg-gold/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-[1300px] px-5 md:px-10">
        <Link
          href="/shop"
          data-cursor="link"
          className="pd-in inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-gold-light"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m6-7-7 7 7 7" />
          </svg>
          {t.productPage.back}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* visual */}
          <div className="pd-in lg:sticky lg:top-28 lg:self-start">
            <div className="mx-auto max-w-[520px]">
              <FramedImage
                src={img.src}
                alt={img.alt || name}
                tone={(product.frame_tone as "gold" | "wood" | "black") ?? "gold"}
                strokes
                parallax={false}
                aspect="aspect-[4/5]"
                sizes="(max-width:1024px) 92vw, 42vw"
              />
            </div>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.26em] text-ivory/30">
              {t.productPage.reviewsBadge}
            </p>
          </div>

          {/* details */}
          <div>
            <div className="pd-in flex items-center gap-3">
              {product.is_featured && (
                <span className="rounded-full bg-gold px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink">
                  {t.shopPage.featured}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/35">
                {SHOP.name}
              </span>
            </div>
            <h1 className="pd-in mt-4 font-serif text-4xl leading-[1.05] text-ivory md:text-6xl">
              {name}
            </h1>
            <p className="pd-in mt-4 max-w-lg text-sm leading-6 text-ivory/55 md:text-base md:leading-7">
              {desc}
            </p>
            <p className="pd-in mt-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-ivory/40">
                {t.productPage.from}
              </span>
              <span className="ml-3 font-serif text-3xl text-gold-light md:text-4xl">
                {formatINR(base)}
              </span>
            </p>
            <p className="pd-in mt-1 text-[11px] text-ivory/40">{t.productPage.taxNote} · {t.productPage.includes}</p>

            {/* options */}
            <div className="mt-9 space-y-6">
              {groups.map(([kind, list]) => (
                <div key={kind} className="pd-in">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/50">
                    {kindTitle(kind)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {list.map((o) => {
                      const active = selected[kind] === o.key;
                      const delta = Number(o.price_delta);
                      return (
                        <button
                          key={o.key}
                          onClick={() => setSelected((s) => ({ ...s, [kind]: o.key }))}
                          data-cursor="link"
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                            active
                              ? "border-gold bg-gold text-ink shadow-glowgold"
                              : "border-ivory/15 text-ivory/65 hover:border-gold/60 hover:text-gold-light"
                          }`}
                        >
                          {optionLabel(o)}
                          {delta > 0 && (
                            <span className={active ? " text-ink/70" : " text-ivory/35"}>
                              {" "}+{formatINR(delta)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* qty + total */}
              <div className="pd-in flex items-center justify-between gap-4 border-t border-gold/15 pt-6">
                <div className="flex items-center gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/50">
                    {t.productPage.qty}
                  </p>
                  <div className="flex items-center gap-1 rounded-full border border-ivory/15 p-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      data-cursor="link"
                      aria-label="decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-white/5 hover:text-gold-light"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-serif text-lg text-ivory">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(20, q + 1))}
                      data-cursor="link"
                      aria-label="increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-white/5 hover:text-gold-light"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">
                    {t.productPage.total}
                  </p>
                  <p className="font-serif text-3xl text-gold-light">{formatINR(total)}</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="pd-in flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={addToCart}
                    data-cursor="link"
                    className={`flex flex-1 items-center justify-center gap-3 rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
                      added
                        ? "bg-emerald-700/80 text-emerald-50"
                        : "bg-gold text-ink shadow-glowgold hover:bg-gold-light"
                    }`}
                  >
                    {added ? (
                      <>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {t.productPage.added}
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                        </svg>
                        {t.productPage.addToCart}
                      </>
                    )}
                  </button>
                  <Link
                    href={`https://wa.me/918303108051?text=${orderText}`}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="flex flex-1 items-center justify-center gap-3 rounded-full border border-ivory/15 px-7 py-4 text-sm font-semibold text-ivory/85 transition-colors hover:border-gold hover:text-gold-light"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.38-.52.05-1 .24-3.35-.7-2.83-1.12-4.63-3.99-4.77-4.18-.14-.18-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.28.55-.35.74-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.49-.09.18-.13.3-.27.46-.14.16-.29.36-.42.48-.14.14-.29.29-.12.57.16.28.72 1.19 1.55 1.93 1.07 1.02 1.96 1.34 2.24 1.49.28.14.44.12.6-.07.16-.18.69-.81.88-1.08.18-.28.37-.23.62-.14.25.1 1.6.76 1.88.9.28.14.46.21.53.32.07.12.07.67-.18 1.11z" />
                    </svg>
                    {t.productPage.orderWhatsapp}
                  </Link>
                </div>
                <Link
                  href={SHOP.phoneHref}
                  data-cursor="link"
                  className="flex items-center justify-center gap-3 rounded-full border border-transparent px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/50 transition-colors hover:border-ivory/15 hover:text-gold-light"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2.05z" />
                  </svg>
                  {t.productPage.callShop}
                </Link>
              </div>

              {/* info accordions */}
              <div className="pd-in mt-2 space-y-3">
                {[
                  { title: t.productPage.pickupTitle, body: t.productPage.pickupBody },
                  { title: t.productPage.payTitle, body: t.productPage.payBody },
                ].map((a) => (
                  <details
                    key={a.title}
                    className="group rounded-xl border border-ivory/10 bg-white/[0.02] px-5 py-4 open:border-gold/30"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ivory/80 transition-colors hover:text-gold-light">
                      {a.title}
                      <span className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-ivory/50">{a.body}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-28">
            <h2 className="font-serif text-3xl text-ivory md:text-4xl">
              {t.productPage.relatedTitle}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-7 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  image={primaryImage(p.slug, relatedImages[p.slug])}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
