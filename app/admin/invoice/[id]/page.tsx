"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getInsforge } from "@/lib/insforge/client";
import { SHOP } from "@/lib/site-config";
import { biText, inr } from "@/lib/admin-shared";

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  total_amount: number | string;
  delivery_method: string;
  delivery_address: { name?: string; phone?: string; line?: string } | null;
  customer_note: string | null;
  created_at: string;
  user_id: string;
};
type ItemRow = {
  id: string;
  name: unknown;
  options: Record<string, string> | null;
  qty: number;
  unit_price: number | string;
  line_total: number | string;
};

const STATUS_STAMP: Record<string, { text: string; cls: string }> = {
  paid: { text: "PAID", cls: "border-emerald-600 text-emerald-700" },
  in_production: { text: "PAID", cls: "border-emerald-600 text-emerald-700" },
  ready_for_pickup: { text: "PAID", cls: "border-emerald-600 text-emerald-700" },
  out_for_delivery: { text: "PAID", cls: "border-emerald-600 text-emerald-700" },
  completed: { text: "PAID", cls: "border-emerald-600 text-emerald-700" },
  payment_pending: { text: "PAYMENT DUE", cls: "border-amber-500 text-amber-600" },
  payment_verifying: { text: "PAYMENT DUE", cls: "border-amber-500 text-amber-600" },
  payment_rejected: { text: "PAYMENT DUE", cls: "border-amber-500 text-amber-600" },
  cancelled: { text: "CANCELLED", cls: "border-red-500 text-red-600" },
};

function Splash({ text }: { text: string }) {
  return (
    <main className="flex min-h-[100svh] items-center justify-center">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">{text}</p>
    </main>
  );
}

export default function InvoicePage() {
  const auth = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [customer, setCustomer] = useState<string>("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace(`/login?next=/admin/invoice/${params.id}`);
  }, [auth.loading, auth.user, router, params.id]);

  const load = useCallback(async () => {
    const db = getInsforge().database;
    const { data: oRows, error: oErr } = await db.from("orders").select("*").eq("id", params.id).limit(1);
    if (oErr) throw new Error(String((oErr as { message?: string }).message || oErr));
    const o = (oRows || [])[0] as OrderRow | undefined;
    if (!o) throw new Error("Order not found.");
    const [{ data: iRows }, { data: pRows }] = await Promise.all([
      db.from("order_items").select("*").eq("order_id", o.id),
      db.from("profiles").select("full_name, phone").eq("id", o.user_id).limit(1),
    ]);
    setOrder(o);
    setItems((iRows || []) as ItemRow[]);
    const prof = (pRows || [])[0] as { full_name?: string; phone?: string } | undefined;
    setCustomer(prof?.full_name || o.delivery_address?.name || "Customer");
  }, [params.id]);

  useEffect(() => {
    if (auth.isAdmin) load().catch((e) => setErr(e instanceof Error ? e.message : "Failed")).finally(() => setLoading(false));
  }, [auth.isAdmin, load]);

  if (auth.loading) return <Splash text="Loading…" />;
  if (!auth.user) return <Splash text="Redirecting…" />;
  if (!auth.isAdmin) return <Splash text="Owner-only area." />;
  if (loading) return <Splash text="Preparing bill…" />;
  if (err || !order) return <Splash text={err || "Order not found."} />;

  const stamp = STATUS_STAMP[order.status] || STATUS_STAMP.completed;
  const d = new Date(order.created_at);
  const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  return (
    <main className="min-h-[100svh] bg-neutral-100 px-4 py-8 text-neutral-900">
      {/* print: only the sheet */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-sheet, .invoice-sheet * { visibility: visible; }
          .invoice-sheet { position: absolute !important; inset: 0 !important; margin: 0 !important;
            width: 100% !important; box-shadow: none !important; border-radius: 0 !important; }
        }
        @page { size: A5 portrait; margin: 8mm; }
      `}</style>

      <div className="mx-auto mb-5 flex max-w-[600px] items-center justify-between">
        <Link href="/admin" data-cursor="link"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-neutral-800">
          ← Back to studio
        </Link>
        <button
          onClick={() => window.print()}
          data-cursor="link"
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-700"
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* ── invoice sheet ── */}
      <div className="invoice-sheet mx-auto max-w-[600px] rounded-lg bg-white p-8 shadow-lg">
        {/* header */}
        <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-5">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">{SHOP.name}</h1>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">& {SHOP.unit}</p>
            <p className="mt-2 text-[11px] leading-4 text-neutral-600">
              {SHOP.addressLines.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
              <span className="mt-1 block font-semibold">{SHOP.phoneDisplay}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Cash Bill / Invoice</p>
            <p className="mt-1 font-mono text-lg font-bold">{order.order_no}</p>
            <p className="mt-1 text-[11px] text-neutral-500">{dateStr} · {timeStr}</p>
            <span className={`mt-3 inline-block rotate-[4deg] rounded border-2 px-3 py-1 text-xs font-black tracking-[0.2em] ${stamp.cls}`}>
              {stamp.text}
            </span>
          </div>
        </div>

        {/* customer */}
        <div className="mt-4 flex flex-wrap justify-between gap-2 text-[12px]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-neutral-400">Billed to</p>
            <p className="mt-1 font-semibold">
              {customer}
              {order.delivery_address?.phone ? ` · ${order.delivery_address.phone}` : ""}
            </p>
            {order.delivery_address?.line && <p className="text-neutral-500">{order.delivery_address.line}</p>}
          </div>
          <p className="self-end text-neutral-500">
            {order.delivery_method === "local_delivery" ? "🛵 Local delivery (Raebareli)" : "🏪 Shop pickup"}
          </p>
        </div>

        {/* items */}
        <table className="mt-5 w-full text-[12px]">
          <thead>
            <tr className="border-b border-neutral-300 text-left text-[9px] uppercase tracking-[0.18em] text-neutral-400">
              <th className="pb-2 font-semibold">Item</th>
              <th className="pb-2 text-center font-semibold">Qty</th>
              <th className="pb-2 text-right font-semibold">Rate</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-neutral-100 align-top">
                <td className="py-2.5 pr-2">
                  <p className="font-semibold">{biText(it.name as never)}</p>
                  {it.options && (
                    <p className="text-[10px] text-neutral-500">
                      {Object.entries(it.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                </td>
                <td className="py-2.5 text-center">{it.qty}</td>
                <td className="py-2.5 text-right">{inr(it.unit_price)}</td>
                <td className="py-2.5 text-right font-semibold">{inr(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Total
              </td>
              <td className="pt-3 text-right font-serif text-xl font-bold">{inr(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>

        {/* footer */}
        <div className="mt-8 flex items-end justify-between border-t border-neutral-200 pt-4 text-[10px] text-neutral-500">
          <div>
            <p className="font-semibold text-neutral-700">Dhanyavaad! Thank you for shopping with us. 🙏</p>
            <p className="mt-1">Frames are crafted to order — exchange only for transit damage (report in 24 hrs).</p>
            <p className="mt-1">Order updates: quality-glass-website.vercel.app/track</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">Authorised signatory</p>
            <p className="mt-6 border-t border-neutral-300 pt-1 font-semibold text-neutral-700">{SHOP.name}</p>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-[600px] text-center text-[10px] uppercase tracking-[0.2em] text-neutral-400">
        Tip: choose “Save as PDF” in the print dialog to keep a digital copy
      </p>
    </main>
  );
}
