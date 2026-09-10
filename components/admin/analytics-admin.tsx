"use client";

import { useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

type Order = { id: string; order_no: string; status: string; total_amount: number | string; created_at: string };

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default function AnalyticsAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getInsforge().database
          .from("orders")
          .select("id, order_no, status, total_amount, created_at")
          .order("created_at", { ascending: false });
        setOrders((data as Order[]) ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-ivory/50 text-sm">Loading analytics…</p>;

  // ── metrics ──────────────────────────────────────────────
  const now = Date.now();
  const inLast = (iso: string, days: number) => now - new Date(iso).getTime() < days * 86400_000;
  const amt = (o: Order) => Number(o.total_amount) || 0;
  const revenue = (days: number) => orders.filter((o) => inLast(o.created_at, days)).reduce((s, o) => s + amt(o), 0);
  const revenueAll = orders.reduce((s, o) => s + amt(o), 0);
  const count = (days: number) => orders.filter((o) => inLast(o.created_at, days)).length;
  const avg = orders.length ? Math.round(revenueAll / orders.length) : 0;

  // daily orders for the last 14 days (mini bar chart)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { key: dayKey(d), label: `${d.getDate()}/${d.getMonth() + 1}`, n: 0, sum: 0 };
  });
  for (const o of orders) {
    const k = o.created_at?.slice(0, 10);
    const slot = days.find((d) => d.key === k);
    if (slot) { slot.n += 1; slot.sum += amt(o); }
  }
  const maxN = Math.max(1, ...days.map((d) => d.n));

  // status breakdown
  const statuses = ["payment_pending", "payment_verifying", "paid", "in_production", "ready", "out_for_delivery", "delivered", "cancelled"];
  const byStatus = statuses.map((s) => ({ s, n: orders.filter((o) => o.status === s).length })).filter((x) => x.n > 0);

  const Card = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ivory/40">{label}</p>
      <p className="mt-2 font-serif text-2xl text-ivory">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-gold-light/70">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Revenue · 7 days" value={fmt(revenue(7))} sub={`${count(7)} orders`} />
        <Card label="Revenue · 30 days" value={fmt(revenue(30))} sub={`${count(30)} orders`} />
        <Card label="All-time revenue" value={fmt(revenueAll)} sub={`${orders.length} orders total`} />
        <Card label="Avg order value" value={fmt(avg)} sub="per order" />
      </div>

      <div className="rounded-xl border border-ivory/10 bg-ivory/[0.03] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Orders · last 14 days</p>
        <div className="mt-4 flex h-36 items-end gap-1.5">
          {days.map((d) => (
            <div key={d.key} className="group relative flex-1 rounded-t bg-gold/25 hover:bg-gold/45" style={{ height: `${Math.max(4, (d.n / maxN) * 100)}%` }}>
              <div className="absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[10px] text-gold-light group-hover:block">
                {d.label} · {d.n} order{d.n === 1 ? "" : "s"} · {fmt(d.sum)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1.5 text-[9px] text-ivory/35">
          {days.map((d, i) => <span key={d.key} className="flex-1 text-center">{i % 2 ? "" : d.label}</span>)}
        </div>
      </div>

      <div className="rounded-xl border border-ivory/10 bg-ivory/[0.03] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Orders by status</p>
        <div className="mt-3 space-y-2">
          {byStatus.map(({ s, n }) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-40 text-[11px] capitalize text-ivory/60">{s.replaceAll("_", " ")}</span>
              <div className="h-2 flex-1 rounded-full bg-ivory/10">
                <div className="h-full rounded-full bg-gold/60" style={{ width: `${(n / orders.length) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-xs text-gold-light">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
