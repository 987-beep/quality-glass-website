"use client";

import { useCallback, useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

type Row = { id: string; full_name: string | null; email: string | null; loyalty_points: number };

export default function LoyaltyAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [amount, setAmount] = useState({});

  const load = useCallback(async () => {
    const { data } = await getInsforge().database
      .from("profiles")
      .select("id, full_name, email, loyalty_points")
      .order("loyalty_points", { ascending: false });
    setRows((data as Row[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  const adjust = async (r: Row, delta: number) => {
    setBusy(r.id);
    await getInsforge().database
      .from("profiles")
      .update({ loyalty_points: Math.max(0, (r.loyalty_points ?? 0) + delta) })
      .eq("id", r.id);
    toastMsg(`${delta > 0 ? "+" : ""}${delta} pts — ${r.full_name || r.email}`); load();
    setBusy("");
  };

  if (loading) return <p className="text-sm text-ivory/50">Loading loyalty accounts…</p>;

  return (
    <div className="space-y-5">
      {toast && <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs text-gold-light">{toast}</div>}
      <div className="rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4 text-xs leading-5 text-ivory/55">
        💛 <b className="text-ivory">Loyalty points</b> — customers ko unke account me dikhte hain.
        Completed orders auto-credit hone ka rule: <b className="text-gold-light">₹100 spent = 1 pt</b> (orders tab se complete mark karte hi lagta hai).
        Yahan se manual adjust (+/− gifting, apology, festival bonus) bhi kar sakte ho.
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4">
            <div className="min-w-[200px] flex-1">
              <p className="text-sm font-semibold text-ivory">{r.full_name || "(no name)"}</p>
              <p className="text-[11px] text-ivory/45">{r.email}</p>
            </div>
            <span className="font-serif text-2xl text-gold-light">{r.loyalty_points ?? 0}<span className="ml-1 text-xs text-ivory/40">pts</span></span>
            <div className="flex gap-1.5">
              {[-10, -1, +1, +10].map((d) => (
                <button key={d} onClick={() => adjust(r, d)} disabled={busy === r.id} data-cursor="link"
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${d < 0 ? "border-cherry/40 text-cherry hover:bg-cherry/10" : "border-leaf/40 text-leaf hover:bg-leaf/10"}`}>
                  {d > 0 ? `+${d}` : d}
                </button>
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-ivory/40">Customers aate hi yahan dikhenge.</p>}
      </div>
    </div>
  );
}
