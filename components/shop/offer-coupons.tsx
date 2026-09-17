"use client";

import { useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { formatINR } from "@/lib/format";
import { useLanguage } from "@/components/providers/language-provider";

type Coupon = {
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  min_order: number | null;
  note: string | null;
};

/** BEST OFFERS box on the product page — live active coupons, tap-to-copy (Santi pattern). */
export default function OfferCoupons() {
  const { t } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getInsforge()
          .database.from("coupons")
          .select("code, percent_off, amount_off, min_order, note")
          .eq("is_active", true);
        setCoupons(((data as Coupon[]) ?? []).slice(0, 3));
      } catch {
        /* box simply stays hidden */
      }
    })();
  }, []);

  if (coupons.length === 0) return null;

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* older browsers: selection fallback below */
    }
    setCopied(code);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const describe = (c: Coupon) => {
    const parts: string[] = [];
    if (c.amount_off) parts.push(`Flat ${formatINR(Number(c.amount_off))} off`);
    else if (c.percent_off) parts.push(`${c.percent_off}% off`);
    if (c.min_order) parts.push(`on orders over ${formatINR(Number(c.min_order))}`);
    return parts.join(" ");
  };

  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
        {t.productPage.bestOffers}
      </p>
      <ul className="mt-3 space-y-2.5">
        {coupons.map((c) => (
          <li
            key={c.code}
            className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gold/40 px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ivory/85">
                {c.note || describe(c) || `${c.percent_off}% off`}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ivory/40">
                {c.code}
                {c.min_order ? ` · min ${formatINR(Number(c.min_order))}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(c.code)}
              data-cursor="link"
              className={`shrink-0 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${
                copied === c.code
                  ? "bg-leaf text-ink"
                  : "border border-gold/60 text-gold hover:bg-gold hover:text-ink"
              }`}
            >
              {copied === c.code ? t.productPage.copied : t.productPage.copyCode}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
