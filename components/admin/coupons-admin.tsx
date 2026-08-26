"use client";

import { useCallback, useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { errMsg } from "@/components/providers/auth-provider";
import { inr, dt } from "@/lib/admin-shared";

/** listing #3: offer-code manager (checkout coupon field validates against this table). */

type Coupon = {
  id: string;
  code: string;
  percent_off: number;
  min_order: number | string;
  is_active: boolean;
  ends_at: string | null;
  note: string | null;
  created_at: string;
};

const inputCls =
  "w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none";

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const { data, error } = await getInsforge().database.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(errMsg(error));
    setCoupons((data || []) as Coupon[]);
  }, []);

  useEffect(() => { load().catch((e) => setErr(errMsg(e))); }, [load]);

  const add = useCallback(async () => {
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(c)) { setErr("Code: 3–20 letters/numbers, no spaces (e.g. DIWALI10)."); return; }
    const p = Number(pct);
    if (!Number.isFinite(p) || p < 1 || p > 90) { setErr("Discount % must be between 1 and 90."); return; }
    setBusy(true); setErr("");
    try {
      const { error } = await getInsforge().database.from("coupons").insert([{
        code: c,
        percent_off: p,
        min_order: Number(minOrder) || 0,
        ends_at: endsAt ? new Date(endsAt + "T23:59:59+05:30").toISOString() : null,
      }]);
      if (error) throw new Error(errMsg(error));
      setCode(""); setPct("10"); setMinOrder(""); setEndsAt("");
      await load();
      toastMsg(`Code ${c} is live ✓ — works at checkout now`);
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  }, [code, pct, minOrder, endsAt, load]);

  const toggle = useCallback(async (cp: Coupon) => {
    try {
      const { error } = await getInsforge().database.from("coupons").update({ is_active: !cp.is_active }).eq("id", cp.id);
      if (error) throw new Error(errMsg(error));
      setCoupons((xs) => xs.map((x) => (x.id === cp.id ? { ...x, is_active: !cp.is_active } : x)));
      toastMsg(cp.is_active ? `${cp.code} switched off` : `${cp.code} is live again ✓`);
    } catch (e) { setErr(errMsg(e)); }
  }, []);

  const del = useCallback(async (id: string) => {
    try {
      const { error } = await getInsforge().database.from("coupons").delete().eq("id", id);
      if (error) throw new Error(errMsg(error));
      setConfirmDel(null);
      setCoupons((xs) => xs.filter((x) => x.id !== id));
      toastMsg("Code deleted");
    } catch (e) { setErr(errMsg(e)); }
  }, []);

  return (
    <section className="mt-10 rounded-2xl border border-gold/25 bg-gold/[0.03] p-5 md:p-6">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-leaf/50 bg-ink px-5 py-2.5 text-xs font-semibold text-leaf shadow-xl">{toast}</div>
      )}
      <h3 className="font-serif text-xl text-ivory">Offer codes · ऑफर कोड</h3>
      <p className="mt-1.5 text-xs leading-5 text-ivory/45">
        Customers type these at checkout for % off (e.g. <span className="text-gold-light">DIWALI10</span>). Share codes on WhatsApp status — active codes are visible to the checkout page.
      </p>
      {err && (
        <p className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
          {err} <button className="float-right underline" onClick={() => setErr("")}>dismiss</button>
        </p>
      )}

      {/* new code form */}
      <div className="mt-4 grid gap-3 rounded-xl border border-ivory/10 bg-ink p-4 sm:grid-cols-[1.2fr_0.6fr_0.8fr_1fr_auto]">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE (e.g. DIWALI10)" className={`${inputCls} uppercase`} />
        <input value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="% off" inputMode="numeric" className={inputCls} />
        <input value={minOrder} onChange={(e) => setMinOrder(e.target.value.replace(/\D/g, ""))} placeholder="Min ₹ (optional)" inputMode="numeric" className={inputCls} />
        <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="date" title="Expiry date (optional)" className={`${inputCls} [color-scheme:dark]`} />
        <button onClick={add} disabled={busy} data-cursor="link"
          className="rounded-lg bg-gold px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light disabled:opacity-50">
          {busy ? "…" : "Add code"}
        </button>
      </div>

      {/* list */}
      <div className="mt-4 grid gap-2">
        {coupons.length === 0 && (
          <p className="rounded-xl border border-dashed border-gold/25 p-6 text-center text-xs text-ivory/40">
            No offer codes yet — add your first festival code above.
          </p>
        )}
        {coupons.map((cp) => (
          <div key={cp.id} className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${cp.is_active ? "border-ivory/10 bg-white/[0.03]" : "border-red-400/20 bg-red-500/[0.03]"}`}>
            <span className="rounded-lg bg-gold/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold-light">{cp.code}</span>
            <span className="text-sm font-semibold text-ivory">{cp.percent_off}% off</span>
            {Number(cp.min_order) > 0 && <span className="text-[11px] text-ivory/45">min {inr(cp.min_order)}</span>}
            {cp.ends_at && <span className="text-[11px] text-ivory/45">till {new Date(cp.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
            {!cp.is_active && <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-300">off</span>}
            <span className="text-[10px] text-ivory/30">{dt(cp.created_at)}</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => toggle(cp)} data-cursor="link"
                className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${cp.is_active ? "border-leaf/40 text-leaf" : "border-red-400/30 text-red-300"}`}>
                {cp.is_active ? "● Live" : "○ Off"}
              </button>
              {confirmDel === cp.id ? (
                <button onClick={() => del(cp.id)} data-cursor="link"
                  className="rounded-full bg-red-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Confirm?</button>
              ) : (
                <button onClick={() => { setConfirmDel(cp.id); setTimeout(() => setConfirmDel(null), 4000); }} data-cursor="link"
                  className="rounded-full border border-red-400/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/10">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
