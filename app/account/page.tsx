"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { getInsforge } from "@/lib/insforge/client";
import { formatINR } from "@/lib/format";

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  total_amount: number;
  delivery_method: string;
  created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  payment_pending: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  payment_verifying: "border-sky-400/40 bg-sky-500/10 text-sky-300",
  payment_rejected: "border-red-400/40 bg-red-500/10 text-red-300",
  paid: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  in_production: "border-violet-400/40 bg-violet-500/10 text-violet-300",
  ready_for_pickup: "border-gold/50 bg-gold/10 text-gold-light",
  out_for_delivery: "border-sky-400/40 bg-sky-500/10 text-sky-300",
  completed: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-ivory/20 bg-ivory/5 text-ivory/50",
};

export default function AccountPage() {
  const auth = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace("/login?next=/account");
    if (!auth.loading && auth.isAdmin) router.replace("/admin");
  }, [auth.loading, auth.user, auth.isAdmin, router]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const db = getInsforge().database;
      const { data } = await db
        .from("orders")
        .select("id,order_no,status,total_amount,delivery_method,created_at")
        .order("created_at", { ascending: false });
      const rows = (data as OrderRow[]) ?? [];
      setOrders(rows);
      const counts: Record<string, number> = {};
      await Promise.all(
        rows.map(async (o) => {
          const { data: items } = await db
            .from("order_items")
            .select("qty")
            .eq("order_id", o.id);
          counts[o.id] = ((items as { qty: number }[]) ?? []).reduce(
            (n, i) => n + i.qty,
            0
          );
        })
      );
      setItemCounts(counts);
    })();
  }, [auth.user]);

  if (auth.loading || !auth.user) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ivory/40">Loading…</p>
      </main>
    );
  }

  const name =
    auth.profile?.full_name ||
    auth.profile?.username ||
    auth.user.email?.split("@")[0] ||
    "Customer";

  return (
    <main className="relative min-h-[100svh] overflow-hidden px-5 pb-28 pt-28 md:pt-36">
      <div aria-hidden className="absolute -top-24 right-10 h-[360px] w-[360px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[900px]">
        <Link
          href="/"
          data-cursor="link"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-gold-light"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m6-7-7 7 7 7" />
          </svg>
          ←
        </Link>

        {/* profile card */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold font-serif text-2xl text-ink">
              {name[0].toUpperCase()}
            </span>
            <div>
              <h1 className="font-serif text-3xl text-ivory">{name}</h1>
              <p className="mt-0.5 text-sm text-ivory/50">
                {auth.profile?.username
                  ? `@${auth.profile.username}`
                  : auth.user.email}{" "}
                · {t.account.member}
              </p>
              {auth.profile?.phone && (
                <p className="text-xs text-ivory/35">+91 {auth.profile.phone}</p>
              )}
            </div>
          </div>
          <button
            onClick={auth.signOut}
            data-cursor="link"
            className="rounded-full border border-ivory/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
          >
            Sign out
          </button>
        </div>

        {/* orders */}
        <h2 className="mt-14 font-serif text-2xl text-ivory md:text-3xl">
          {t.account.orders}
        </h2>

        {orders === null ? (
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-ivory/40">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gold/25 bg-gold/[0.04] p-10 text-center">
            <p className="text-sm leading-6 text-ivory/55">{t.account.noOrders}</p>
            <Link
              href="/shop"
              data-cursor="link"
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-gold px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
            >
              {t.cart.shopNow}
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((o) => {
              const style =
                STATUS_STYLE[o.status] ?? STATUS_STYLE.cancelled;
              const label =
                (t.checkout.status as Record<string, string>)[o.status] ??
                o.status;
              const needsPay =
                o.status === "payment_pending" || o.status === "payment_rejected";
              return (
                <div
                  key={o.id}
                  className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 transition-colors hover:border-gold/25 md:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg text-ivory">{o.order_no}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ivory/40">
                        {t.account.placed}:{" "}
                        {new Date(o.created_at).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "short", year: "numeric" }
                        )}{" "}
                        · {itemCounts[o.id] ?? "…"} {t.account.items} ·{" "}
                        {o.delivery_method === "local_delivery"
                          ? t.checkout.homeDelivery
                          : t.checkout.pickup}
                      </p>
                    </div>
                    <p className="font-serif text-xl text-gold-light">
                      {formatINR(o.total_amount)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${style}`}
                    >
                      {label}
                    </span>
                    {needsPay && (
                      <Link
                        href={`/checkout?order=${o.id}`}
                        data-cursor="link"
                        className="rounded-full bg-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light"
                      >
                        {t.account.payNow}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
