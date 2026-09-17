"use client";

import Link from "next/link";
import type { Product, ProductImage } from "@/lib/server/catalog";
import {
  priceOf,
  compareOf,
  discountPct,
} from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";
import { formatINR } from "@/lib/format";
import { useLanguage } from "@/components/providers/language-provider";
import Image from "next/image";

const COPY = {
  en: {
    kicker: "Ready wall combos",
    title: "Wall sets — one price, whole gallery",
    sub: "Curated frame combos like the pros hang them. Add your photos, we arrange the wall.",
    frames: "frames",
    save: "combo saving",
  },
  hi: {
    kicker: "रेडी वॉल कॉम्बो",
    title: "वॉल सेट — एक दाम, पूरी गैलरी",
    sub: "प्रोफेशनल स्टाइल में तैयार फ्रेम कॉम्बो। आप फ़ोटो दें, हम दीवार सजाएं।",
    frames: "फ्रेम",
    save: "कॉम्बो बचत",
  },
};

/** Frameley "Clusters" pattern: ready multi-frame bundles with combo discount. */
export default function WallSets({
  bundles,
  images,
}: {
  bundles: Product[];
  images: ProductImage[];
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  if (bundles.length === 0) return null;

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{c.kicker}</p>
        <h2 className="mt-3 text-center font-serif text-3xl text-ivory md:text-4xl">{c.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-ivory/50">{c.sub}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => {
            const img = primaryImage(b.slug, images.filter((i) => i.product_id === b.id));
            const price = priceOf(b);
            const mrp = compareOf(b);
            const pct = discountPct(b);
            return (
              <Link
                key={b.id}
                href={`/product/${b.slug}`}
                data-cursor="view"
                className="group overflow-hidden rounded-2xl border border-ivory/10 bg-white/[0.02] transition-all duration-300 hover:border-gold/40 hover:shadow-[0_16px_48px_rgba(201,162,75,0.12)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width:640px) 92vw, 360px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {b.bundle_count ? (
                    <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-light backdrop-blur">
                      {b.bundle_count} {c.frames}
                    </span>
                  ) : null}
                  {pct > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-[#c2402f] px-2.5 py-1 text-[10px] font-bold text-ivory">
                      {pct}% OFF
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg text-ivory group-hover:text-gold-light">
                    {String(b.name[lang as "en" | "hi"] || b.name.en)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ivory/45">
                    {String(b.description?.[lang as "en" | "hi"] || b.description?.en || "")}
                  </p>
                  <p className="mt-3 flex items-baseline gap-2.5">
                    <span className="font-serif text-xl text-gold-light">{formatINR(price)}</span>
                    {mrp && mrp > price && (
                      <>
                        <span className="text-xs text-ivory/35 line-through">{formatINR(mrp)}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-leaf">
                          {c.save} {formatINR(mrp - price)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
