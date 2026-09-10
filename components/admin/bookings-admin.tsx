"use client";

import { useCallback, useEffect, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { waLink } from "@/lib/whatsapp";

type Booking = {
  id: string; customer_name: string; phone: string | null; item: string;
  notes: string | null; scheduled_at: string;
  status: "scheduled" | "ready" | "collected" | "cancelled";
  order_no: string | null;
};

const CHIP: Record<Booking["status"], string> = {
  scheduled: "bg-gold/15 text-gold-light border-gold/40",
  ready: "bg-leaf/15 text-leaf border-leaf/40",
  collected: "bg-ivory/10 text-ivory/50 border-ivory/20",
  cancelled: "bg-cherry/15 text-cherry border-cherry/40",
};
const NEXT: Record<Booking["status"], Booking["status"]> = {
  scheduled: "ready", ready: "collected", collected: "scheduled", cancelled: "cancelled",
};

export default function BookingsAdmin() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState("");
  const [form, setForm] = useState({ customer_name: "", phone: "", item: "", notes: "", scheduled_at: "" });

  const load = useCallback(async () => {
    const { data } = await getInsforge().database
      .from("bookings").select("*").order("scheduled_at", { ascending: false });
    setRows((data as Booking[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const setStatus = async (b: Booking, status: Booking["status"]) => {
    setBusy(b.id);
    const { error } = await getInsforge().database.from("bookings").update({ status }).eq("id", b.id);
    if (!error) { toastMsg(status === "ready" ? "📦 Marked ready — message the customer." : `Moved to ${status}.`); load(); }
    else toastMsg(error.message ?? "Could not update.");
    setBusy("");
  };

  const add = async () => {
    if (!form.customer_name.trim() || !form.item.trim() || !form.scheduled_at) {
      toastMsg("Name, item and date-time are required."); return;
    }
    setBusy("add");
    const { error } = await getInsforge().database.from("bookings").insert([{
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim() || null,
      item: form.item.trim(),
      notes: form.notes.trim() || null,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      status: "scheduled",
    }]);
    if (!error) { toastMsg("📅 Booking added."); setForm({ customer_name: "", phone: "", item: "", notes: "", scheduled_at: "" }); load(); }
    else toastMsg(error.message ?? "Could not add booking.");
    setBusy("");
  };

  const remind = (b: Booking) => {
    const when = new Date(b.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    const txt = `Namaste ${b.customer_name.split(" ")[0]}! 🙏 Reminder from Quality Glass Emporium — your pickup (${b.item}) is scheduled for ${when}. See you at the shop! 📍 PNT Colony, near Hotel Ganesh, Raebareli. — Quality Glass Emporium`;
    const url = waLink(b.phone, txt);
    if (url) window.open(url, "_blank");
  };

  const upcoming = rows.filter(b => b.status === "scheduled" || b.status === "ready");
  const done = rows.filter(b => b.status === "collected" || b.status === "cancelled");

  if (loading) return <p className="text-sm text-ivory/50">Loading bookings…</p>;

  const Row = ({ b }: { b: Booking }) => (
    <div className="rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-ivory">{b.customer_name}</span>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${CHIP[b.status]}`}>{b.status}</span>
        <span className="text-xs text-ivory/40">📅 {new Date(b.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
        {b.phone && <span className="text-xs text-ivory/40">☎ {b.phone}</span>}
        {b.order_no && <span className="text-xs text-gold-light/70">Order: {b.order_no}</span>}
      </div>
      <p className="mt-2 text-sm text-ivory/70">{b.item}{b.notes && <span className="text-ivory/45"> · {b.notes}</span>}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {b.phone && (
          <button onClick={() => remind(b)} data-cursor="link"
            className="rounded-full border border-leaf/40 bg-leaf/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-leaf transition hover:bg-leaf/20">
            💬 WhatsApp reminder
          </button>
        )}
        {b.status !== "collected" && b.status !== "cancelled" && (
          <>
            <button onClick={() => setStatus(b, NEXT[b.status] as Booking["status"])} disabled={busy === b.id} data-cursor="link"
              className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold-light transition hover:bg-gold/20 disabled:opacity-50">
              {busy === b.id ? "…" : b.status === "scheduled" ? "Mark ready ▸" : "Mark collected ✓"}
            </button>
            <button onClick={() => setStatus(b, "cancelled")} disabled={busy === b.id} data-cursor="link"
              className="rounded-full border border-cherry/40 bg-cherry/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cherry transition hover:bg-cherry/20 disabled:opacity-50">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {toast && <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs text-gold-light">{toast}</div>}

      <div className="rounded-2xl border border-gold/35 bg-gold/[0.05] p-5">
        <h2 className="font-serif text-xl text-ivory">Add booking</h2>
        <p className="mt-1 text-xs text-ivory/50">Customer pickup / collection schedule — phone optional.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
            placeholder="Customer name *" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone (for WhatsApp)" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
            placeholder="Item (e.g. 12x16 gold frame ×2) *" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
          <input value={form.scheduled_at} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
            type="datetime-local" className="rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory focus:border-gold/50 focus:outline-none" />
          <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)" className="sm:col-span-2 rounded-lg border border-ivory/15 bg-ink/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none" />
        </div>
        <button onClick={add} disabled={busy === "add"} data-cursor="link"
          className="mt-4 rounded-full border border-gold/40 bg-gold/15 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-light transition hover:bg-gold/25 disabled:opacity-50">
          {busy === "add" ? "…" : "+ Add booking"}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 && <p className="text-xs text-ivory/40">Schedule khali hai — pehli booking upar se add karo.</p>}
        {upcoming.map((b) => <Row key={b.id} b={b} />)}
      </div>

      {done.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/40">Done / cancelled</h3>
          {done.map((b) => <Row key={b.id} b={b} />)}
        </div>
      )}
    </div>
  );
}
