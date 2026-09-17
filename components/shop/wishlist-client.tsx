"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product, ProductImage } from "@/lib/server/catalog";
import { getWishlist } from "@/lib/wishlist";
import { primaryImage } from "@/lib/product-media";
import ProductCard from "@/components/shop/product-card";
import WishlistHeart from "@/components/shop/wishlist-heart";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  en: {
    title: "Your wishlist ❤️",
    empty: "Nothing saved yet — tap the heart on any frame to keep it here.",
    shop: "Browse the shop",
    loginHint: "Wishlist saves on this device.",
  },
  hi: {
    title: "आपकी विशलिस्ट ❤️",
    empty: "अभी कुछ सेव नहीं — किसी भी फ्रेम पर दिल वाला बटन दबाएं।",
    shop: "दुकान देखें",
    loginHint: "विशलिस्ट इसी डिवाइस पर सेव रहती है।",
  },
};

export default function WishlistClient({
  products,
  images,
}: {
  products: Product[];
  images: ProductImage[];
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    const read = () => setSlugs(getWishlist());
    read();
    window.addEventListener("qge-wishlist", read);
    return () => window.removeEventListener("qge-wishlist", read);
  }, []);

  const list = products.filter((p) => slugs?.includes(p.slug));

  return (
    <main className="relative min-h-[100svh] pb-24 pt-24 md:pt-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <h1 className="font-serif text-3xl text-ivory md:text-4xl">{c.title}</h1>
        <p className="mt-2 text-xs text-ivory/40">{c.loginHint}</p>

        {slugs === null ? null : list.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-sm text-ivory/50">{c.empty}</p>
            <Link
              href="/shop"
              data-cursor="link"
              className="mt-6 inline-flex rounded-full bg-gold px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
            >
              {c.shop} →
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-7 xl:grid-cols-3">
            {list.map((p) => (
              <div key={p.id} className="relative">
                <ProductCard
                  product={p}
                  image={primaryImage(p.slug, images.filter((i) => i.product_id === p.id))}
                />
                <WishlistHeart slug={p.slug} className="absolute right-2.5 top-2.5 bg-ink/60 backdrop-blur" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
