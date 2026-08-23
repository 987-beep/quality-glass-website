"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/server/catalog";
import { priceOf } from "@/lib/server/catalog";
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
          className={`${frame} rounded-[2px] p-[8px] shadow-frame transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[0.6deg] md:p-[10px]`}
        >
          <div className="relative aspect-[4/5] overflow-hidden border border-gold/10 bg-mat">
            <div className="absolute inset-[10px] overflow-hidden bg-ink md:inset-3">
              <Image
                src={image.src}
                alt={image.alt || name}
                fill
                priority={eager}
                sizes="(max-width:640px) 46vw, (max-width:1024px) 30vw, 280px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
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
        </div>
        <p className="shrink-0 font-serif text-lg text-gold-light">
          {formatINR(priceOf(product))}
        </p>
      </div>
    </Link>
  );
}
