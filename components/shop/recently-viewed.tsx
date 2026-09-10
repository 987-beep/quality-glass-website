"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { formatINR } from "@/lib/format";

const KEY = "qg_recently_viewed";
const MAX = 10;

export type ViewedItem = {
  slug: string;
  name: string;
  image: string;
  price: number;
};

/** Read the recently-viewed list from localStorage. */
export function readViewed(): ViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** Push a product to the front of the recently-viewed list. */
export function trackViewed(item: ViewedItem) {
  if (typeof window === "undefined") return;
  try {
    const list = readViewed().filter((v) => v.slug !== item.slug);
    list.unshift(item);
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* quota / private mode — ignore */
  }
}

export default function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { lang } = useLanguage();
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    setItems(readViewed().filter((v) => v.slug !== excludeSlug));
  }, [excludeSlug]);

  if (items.length === 0) return null;

  const title = lang === "hi" ? "हाल ही में देखे गए" : "Recently Viewed";
  const clearLabel = lang === "hi" ? "साफ़ करें" : "Clear";

  const clear = () => {
    try { window.localStorage.removeItem(KEY); } catch { /* noop */ }
    setItems([]);
  };

  return (
    <section className="mt-24 border-t border-ivory/8 pt-12 md:mt-32">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            {lang === "hi" ? "आपकी पसंद" : "Your trail"}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ivory md:text-3xl">{title}</h2>
        </div>
        <button
          onClick={clear}
          className="text-[10px] uppercase tracking-[0.2em] text-ivory/35 transition-colors hover:text-gold-light"
        >
          {clearLabel}
        </button>
      </div>

      <div className="mt-7 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] md:gap-5">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/product/${it.slug}`}
            data-cursor="link"
            className="group w-[150px] shrink-0 md:w-[180px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-ivory/10 bg-ink-2 transition-all duration-500 group-hover:border-gold/40 group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
              <Image
                src={it.image}
                alt={it.name}
                fill
                sizes="180px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <p className="mt-2.5 truncate text-sm text-ivory/80 transition-colors group-hover:text-gold-light">
              {it.name}
            </p>
            <p className="mt-0.5 font-serif text-sm text-gold-light">{formatINR(it.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
