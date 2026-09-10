"use client";

import { useCallback, useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

type Item = { id: string; name: string; unit: string; qty: number; low_threshold: number };

export default function StockAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", unit: "pcs", qty: "0", low: "5" });

  const load = useCallback(async () => {
    const { data } = await getInsforge().database.from("stock_items").select("*").order("name");
    setItems((data as Item[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  const adjust = async (it: Item, delta: number) => {
    const reason = window.prompt(
      `Kya ho raha hai? (${delta > 0 ? "+" : ""}${delta} ${it.unit} — ${it.name})\nExamples: order ready, stock aaya, damage`,
      delta > 0 ? "Stock aaya" : "Order laga"
    );
    if (reason === null) return;
    setBusy(it.id);
    const db = getInsforge().database;
    const { error: e1 } = await db.from("stock_items")
      .update({ qty: Number(it.qty) + delta, updated_at: new Date().toISOString() }).eq("id", it.id);
    if (e1) { toastMsg(e1.message ?? "Update failed."); setBusy(""); return; }
    await db.from("stock_log").insert([{ item_id: it.id, delta, reason: reason || "adjust" }]);
    toastMsg(`${delta > 0 ? "+" : ""}${delta} ${it.unit} — ${it.name} · ${it.qty + delta} ab hai`); load();
    setBusy("");
  };

  const add = async () => {
    if (!form.name.trim()) { toastMsg("Item ka naam likho."); return; }
    setBusy("add");
    const { error } = await getInsforge().database.from("stock_items").insert([{
      name: form.name.trim(), unit: form.unit.trim() || "pcs",
      qty: Number(form.qty) || 0, low_threshold: Number(form.low) || 5,
    }]);
    if (!error) { toastMsg("📦 Stock item added."); setForm({ name: "", unit: "pcs", qty: "0", low: "5" }); load(); }
    else toastMsg(error.message ?? "Could not add.");
    setBusy("");
  };

  const low = items.filter((i) => i.qty <= i.low_threshold);
  if (loading) return <p className="text-sm text-ivory/50">Loading stock…</p>;

  return (
    <div className="space-y-5">
      {toast && <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs text-gold-light">{toast}</div>}

      {low.length > 0 && (
        <div className="rounded-xl border border-cherry/40 bg-cherry/10 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cherry">⚠️ Low stock ({low.length})</p>
          <p className="mt-1 text-xs text-ivory/60">{low.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(" · ")}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gold/35 bg-gold/[0.05] p-5">
        <h2 className="font-serif text-xl text-ivory">+ Add stock item</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Item name *" className="sm:col-span-2 rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="Unit (pcs/ft)" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
            type="number" placeholder="Qty" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
        </div>
        <button onClick={add} disabled={busy === "add"} data-cursor="link"
          className="mt-4 rounded-full border border-gold/40 bg-gold/15 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-light transition hover:bg-gold/25 disabled:opacity-50">
          {busy === "add" ? "…" : "+ Add"}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((it) => {
          const isLow = it.qty <= it.low_threshold;
          return (
            <div key={it.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${isLow ? "border-cherry/40 bg-cherry/5" : "border-ivory/10 bg-ivory/[0.03]"}`}>
              <div className="min-w-[200px] flex-1">
                <p className="text-sm font-semibold text-ivory">{it.name}</p>
                <p className="text-[11px] text-ivory/45">warn below {it.low_threshold} {it.unit}</p>
              </div>
              <span className={`font-serif text-2xl ${isLow ? "text-cherry" : "text-gold-light"}`}>
                {it.qty}<span className="ml-1 text-xs text-ivory/40">{it.unit}</span>
              </span>
              <div className="flex gap-1.5">
                {[-5, -1, +1, +5].map((d) => (
                  <button key={d} onClick={() => adjust(it, d)} disabled={busy === it.id} data-cursor="link"
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                      d < 0 ? "border-cherry/40 text-cherry hover:bg-cherry/10" : "border-leaf/40 text-leaf hover:bg-leaf/10"}`}>
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-xs text-ivory/40">Koi item nahi — upar se add karo.</p>}
      </div>
    </div>
  );
}
