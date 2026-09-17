"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/server/catalog";
import { priceOf, compareOf, discountPct, isNewProduct } from "@/lib/server/catalog";
import { formatINR } from "@/lib/format";
import { useLanguage } from "@/components/providers/language-provider";

export const TONE_FRAME: Record<string, string> = {
  gold: "gold-frame",
  wood: "wood-frame",
  black: "black-frame",
};

export default function ProductCard({
  product,
  image,
  eager,
}: {
  product: Product;
  image: { src: string; alt: string };
  eager?: boolean;
}) {
  const { lang, t } = useLanguage();
  const name = product.name[lang] || product.name.en || product.slug;
  const desc = product.description?.[lang] || product.description?.en || "";
  const frame = TONE_FRAME[product.frame_tone ?? ""] ?? "gold-frame";

  return (
    <Link
      href={`/product/${product.slug}`}
      data-cursor="view"
      data-cursor-label={t.shopPage.view}
      className="shop-card group block"
    >
      <div className="relative">
        {/* frame */}
        <div
          className={`${frame} rounded-[2px] p-[8px] shadow-frame transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(201,162,75,0.15)] group-hover:rotate-[0.6deg] md:p-[10px]`}
        >
          <div className="relative aspect-[4/5] overflow-hidden border border-gold/10 bg-mat">
            <div className="absolute inset-[10px] overflow-hidden bg-ink md:inset-3">
              <Image
                src={image.src}
                alt={image.alt || name}
                fill
                priority={eager}
                sizes="(max-width:640px) 46vw, (max-width:1024px) 30vw, 280px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.15]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discountPct(product) > 0 && (
            <span className="rounded-full bg-[#c2402f] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory shadow">
              {discountPct(product)}% {t.shopPage.badgeOff}
            </span>
          )}
          {isNewProduct(product) && (
            <span className="rounded-full bg-leaf px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink">
              {t.shopPage.badgeNew}
            </span>
          )}
          {product.is_featured && (
            <span className="rounded-full bg-gold px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink shadow-glowgold">
              {t.shopPage.featured}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg leading-6 text-ivory transition-colors group-hover:text-gold-light">
            {name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-ivory/45">{desc}</p>
          {Number(product.rating_avg ?? 0) > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-ivory/40">
              <span className="text-star">★</span>
              {Number(product.rating_avg).toFixed(1)}
              <span className="text-ivory/25">({product.rating_count ?? 0})</span>
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-lg text-gold-light">
            {formatINR(priceOf(product))}
          </p>
          {compareOf(product) && compareOf(product)! > priceOf(product) && (
            <p className="text-[11px] text-ivory/35 line-through">
              {formatINR(compareOf(product)!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
