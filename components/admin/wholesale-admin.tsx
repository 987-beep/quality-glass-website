"use client";

import { useCallback, useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

type Rate = { id: string; label: string; min_qty: number; unit_price: number; sort: number; is_active: boolean };

export default function WholesaleAdmin() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ label: "", min_qty: "10", unit_price: "", sort: "0" });

  const load = useCallback(async () => {
    const { data } = await getInsforge().database.from("bulk_rates").select("*").order("sort").order("label");
    setRates((data as Rate[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  const add = async () => {
    if (!form.label.trim() || !Number(form.unit_price)) { toastMsg("Label + nagdi rate likho."); return; }
    setBusy("add");
    const { error } = await getInsforge().database.from("bulk_rates").insert([{
      label: form.label.trim(), min_qty: Number(form.min_qty) || 10,
      unit_price: Number(form.unit_price), sort: Number(form.sort) || 0, is_active: true,
    }]);
    if (!error) { toastMsg("🏷️ Wholesale tier added (bulk page pe live)."); setForm({ label: "", min_qty: "10", unit_price: "", sort: "0" }); load(); }
    else toastMsg(error.message ?? "Could not add.");
    setBusy("");
  };

  const toggle = async (r: Rate) => {
    setBusy(r.id);
    await getInsforge().database.from("bulk_rates").update({ is_active: !r.is_active }).eq("id", r.id);
    toastMsg(r.is_active ? "Tier hidden from bulk page." : "Tier live again."); load();
    setBusy("");
  };

  const del = async (r: Rate) => {
    if (!window.confirm(`Remove "${r.label} (${r.min_qty}+)" wholesale rate?`)) return;
    setBusy(r.id);
    await getInsforge().database.from("bulk_rates").delete().eq("id", r.id);
    toastMsg("Tier removed."); load();
    setBusy("");
  };

  if (loading) return <p className="text-sm text-ivory/50">Loading wholesale rates…</p>;

  return (
    <div className="space-y-5">
      {toast && <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs text-gold-light">{toast}</div>}

      <div className="rounded-2xl border border-gold/35 bg-gold/[0.05] p-5">
        <h2 className="font-serif text-xl text-ivory">🏭 Wholesale / bulk pricing tiers</h2>
        <p className="mt-1 text-xs text-ivory/50">Ye rate tumhare <b>/bulk</b> page pe customers ko dikhte hain (order of qty bade ho tab per-piece price).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. 12x16 wood frame *" className="sm:col-span-2 rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.min_qty} onChange={(e) => setForm((f) => ({ ...f, min_qty: e.target.value }))}
            type="number" placeholder="Min qty (10)" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.unit_price} onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
            type="number" placeholder="₹ per piece *" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
        </div>
        <button onClick={add} disabled={busy === "add"} data-cursor="link"
          className="mt-4 rounded-full border border-gold/40 bg-gold/15 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-light transition hover:bg-gold/25 disabled:opacity-50">
          {busy === "add" ? "…" : "+ Add tier"}
        </button>
      </div>

      <div className="space-y-2">
        {rates.map((r) => (
          <div key={r.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${r.is_active ? "border-ivory/10 bg-ivory/[0.03]" : "border-ivory/10 bg-ivory/[0.01] opacity-50"}`}>
            <span className="min-w-[220px] flex-1 text-sm font-semibold text-ivory">{r.label}</span>
            <span className="text-xs text-ivory/45">min {r.min_qty} pcs</span>
            <span className="font-serif text-xl text-gold-light">₹{r.unit_price}<span className="ml-1 text-xs text-ivory/40">/pc</span></span>
            <div className="flex gap-1.5">
              <button onClick={() => toggle(r)} disabled={busy === r.id} data-cursor="link"
                className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition disabled:opacity-50 ${r.is_active ? "border-gold/40 text-gold-light hover:bg-gold/10" : "border-leaf/40 text-leaf hover:bg-leaf/10"}`}>
                {r.is_active ? "Hide" : "Live"}
              </button>
              <button onClick={() => del(r)} disabled={busy === r.id} data-cursor="link"
                className="rounded-lg border border-cherry/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-cherry transition hover:bg-cherry/10 disabled:opacity-50">Del</button>
            </div>
          </div>
        ))}
        {rates.length === 0 && <p className="text-xs text-ivory/40">Abhi koi tier nahi — upar se add karo, turant /bulk pe aayega.</p>}
      </div>
    </div>
  );
}
