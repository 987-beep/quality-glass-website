"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { errMsg } from "@/components/providers/auth-provider";
import { Review, biText, dt } from "@/lib/admin-shared";

const Stars = ({ n }: { n: number }) => (
  <span className="text-gold-light tracking-[0.1em]">{"★".repeat(Math.max(0, Math.min(5, n)))}{"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, n))))}</span>
);

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const { data, error } = await getInsforge().database.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(errMsg(error));
    setReviews((data || []) as Review[]);
  }, []);

  useEffect(() => { load().catch((e) => setErr(errMsg(e))).finally(() => setLoading(false)); }, [load]);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => Number(a.is_approved) - Number(b.is_approved)),
    [reviews]
  );

  const setApproved = useCallback(async (r: Review, approved: boolean) => {
    try {
      const { error } = await getInsforge().database.from("reviews").update({ is_approved: approved }).eq("id", r.id);
      if (error) throw new Error(errMsg(error));
      setReviews((xs) => xs.map((x) => (x.id === r.id ? { ...x, is_approved: approved } : x)));
      toastMsg(approved ? "Review is live ✓" : "Review hidden");
    } catch (e) { setErr(errMsg(e)); }
  }, []);

  const del = useCallback(async (id: string) => {
    try {
      const { error } = await getInsforge().database.from("reviews").delete().eq("id", id);
      if (error) throw new Error(errMsg(error));
      setConfirmDel(null);
      setReviews((xs) => xs.filter((x) => x.id !== id));
      toastMsg("Review deleted");
    } catch (e) { setErr(errMsg(e)); }
  }, []);

  if (loading) return <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.25em] text-ivory/40">Loading reviews…</p>;

  return (
    <section className="mt-6">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-leaf/50 bg-ink px-5 py-2.5 text-xs font-semibold text-leaf shadow-xl">{toast}</div>
      )}
      {err && (
        <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3.5 text-xs text-red-200">
          {err} <button className="float-right underline" onClick={() => setErr("")}>dismiss</button>
        </div>
      )}

      <p className="text-xs leading-5 text-ivory/45">
        Customer testimonials. Only <span className="text-leaf">approved</span> reviews show on the website — new ones wait here for your nod.
      </p>

      <div className="mt-5 grid gap-3">
        {sorted.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gold/25 bg-white/[0.02] p-10 text-center text-sm text-ivory/50">
            No reviews yet. They arrive when customers who completed an order leave testimonials.
          </div>
        )}
        {sorted.map((r) => (
          <div key={r.id} className={`flex flex-wrap items-start gap-4 rounded-2xl border p-4 md:p-5 ${r.is_approved ? "border-ivory/10 bg-white/[0.03]" : "border-gold/40 bg-gold/[0.06]"}`}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-ivory">{r.author_name}</span>
                <Stars n={r.rating} />
                <span className="text-[10px] text-ivory/40">{r.area ? `${r.area} · ` : ""}{dt(r.created_at)}</span>
                {!r.is_approved && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-light">pending approval</span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-ivory/65">“{biText(r.quote)}”</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {r.is_approved ? (
                <button onClick={() => setApproved(r, false)} data-cursor="link"
                  className="rounded-full border border-ivory/20 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ivory/70 hover:border-gold/50 hover:text-gold-light">
                  Hide
                </button>
              ) : (
                <button onClick={() => setApproved(r, true)} data-cursor="link"
                  className="rounded-full bg-leaf px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink hover:brightness-110">
                  Approve ✓
                </button>
              )}
              {confirmDel === r.id ? (
                <button onClick={() => del(r.id)} data-cursor="link"
                  className="rounded-full bg-red-500 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Confirm?</button>
              ) : (
                <button onClick={() => { setConfirmDel(r.id); setTimeout(() => setConfirmDel(null), 4000); }} data-cursor="link"
                  className="rounded-full border border-red-400/30 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/10">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
