"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { errMsg } from "@/components/providers/auth-provider";
import {
  Order, OrderItem, PaymentProof, ProfileRow,
  ORDER_STATUS, NEXT_ACTIONS, inr, dt, biText,
} from "@/lib/admin-shared";
import { waLink, orderStatusMessage } from "@/lib/whatsapp";

const FILTERS = [
  { id: "action", label: "Needs action", match: (s: string) => s === "payment_verifying" },
  { id: "active", label: "Active", match: (s: string) => ["paid", "in_production", "ready_for_pickup", "out_for_delivery", "payment_pending"].includes(s) },
  { id: "all", label: "All orders", match: () => true },
  { id: "closed", label: "Closed", match: (s: string) => ["completed", "cancelled", "payment_rejected"].includes(s) },
];

function StatusChip({ status }: { status: string }) {
  const m = ORDER_STATUS[status] || { en: status, hi: "", tone: "text-ivory/60 border-ivory/25" };
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] whitespace-nowrap ${m.tone}`}>
      {m.en}
    </span>
  );
}

export default function OrdersAdmin({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [filter, setFilter] = useState("action");
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const [proofImg, setProofImg] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(async () => {
    const db = getInsforge().database;
    const { data, error } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(errMsg(error));
    const rows = (data || []) as Order[];
    setOrders(rows);
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await db.from("profiles").select("id, full_name, phone, username, role");
      const map: Record<string, ProfileRow> = {};
      ((profs || []) as ProfileRow[]).forEach((p) => { if (ids.includes(p.id)) map[p.id] = p; });
      setProfiles(map);
    }
  }, []);

  const loadDetail = useCallback(async (orderId: string) => {
    const db = getInsforge().database;
    const [it, pr] = await Promise.all([
      db.from("order_items").select("*").eq("order_id", orderId),
      db.from("payment_proofs").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
    ]);
    setItems((it.data || []) as OrderItem[]);
    setProofs((pr.data || []) as PaymentProof[]);
  }, []);

  useEffect(() => {
    load().catch((e) => setErr(errMsg(e))).finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (openId) {
      setRejectNote(""); setAdminNote("");
      const o = orders.find((x) => x.id === openId);
      if (o?.admin_note) setAdminNote(o.admin_note);
      loadDetail(openId).catch((e) => setErr(errMsg(e)));
    }
  }, [openId, orders, loadDetail]);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const moveStatus = useCallback(async (o: Order, to: string) => {
    setBusy(o.id + to); setErr("");
    try {
      const db = getInsforge().database;
      const payload: Record<string, unknown> = { status: to, updated_at: new Date().toISOString() };
      if (adminNote.trim() && adminNote.trim() !== (o.admin_note || "")) payload.admin_note = adminNote.trim();
      const { error } = await db.from("orders").update(payload).eq("id", o.id);
      if (error) throw new Error(errMsg(error));

      if (to === "paid" || to === "payment_rejected") {
        const latest = proofs[0];
        if (latest) {
          const { error: pe } = await db.from("payment_proofs").update({
            status: to === "paid" ? "approved" : "rejected",
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
            admin_note: to === "payment_rejected" ? (rejectNote.trim() || null) : latest.admin_note,
          }).eq("id", latest.id);
          if (pe) throw new Error(errMsg(pe));
        }
      }
      await load(); await loadDetail(o.id);
      toastMsg(`Order ${o.order_no} → ${ORDER_STATUS[to]?.en || to}`);
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(""); }
  }, [adminNote, rejectNote, proofs, userId, load, loadDetail]);

  const viewProof = useCallback(async (p: PaymentProof) => {
    setBusy(p.id); setErr("");
    try {
      const sdk = getInsforge();
      let blob: Blob | null = null;
      try {
        const d = await sdk.storage.from("payment-proofs").download(p.storage_key);
        blob = ((d as { data?: Blob | null })?.data ?? null);
        (d as { error?: { message?: string } | null })?.error?.message &&
          console.warn("download error", (d as { error?: { message?: string } }).error!.message);
      } catch { blob = null; }
      if (!blob) {
        const res = await fetch(`/api/storage/buckets/payment-proofs/objects/${encodeURIComponent(p.storage_key)}`);
        if (!res.ok) throw new Error(`Proof fetch failed (${res.status})`);
        blob = await res.blob();
      }
      if (!blob || blob.size === 0) throw new Error("Empty proof file");
      setProofImg(URL.createObjectURL(blob));
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(""); }
  }, []);

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter) || FILTERS[0];
    return orders.filter((o) => f.match(o.status));
  }, [orders, filter]);

  const actionCount = useMemo(() => orders.filter((o) => o.status === "payment_verifying").length, [orders]);

  if (loading) return <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.25em] text-ivory/40">Loading orders…</p>;

  return (
    <section className="mt-6">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-leaf/50 bg-ink px-5 py-2.5 text-xs font-semibold text-leaf shadow-xl">
          {toast}
        </div>
      )}
      {err && (
        <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3.5 text-xs text-red-200">
          {err} <button className="float-right underline" onClick={() => setErr("")}>dismiss</button>
        </div>
      )}

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            data-cursor="link"
            className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
              filter === f.id ? "border-gold bg-gold/15 text-gold-light" : "border-ivory/15 text-ivory/55 hover:border-gold/40 hover:text-ivory"
            }`}
          >
            {f.label}
            {f.id === "action" && actionCount > 0 && (
              <span className="ml-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] text-ink">{actionCount}</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-ivory/35">{shown.length} / {orders.length}</span>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gold/25 bg-white/[0.02] p-10 text-center text-sm text-ivory/50">
          No orders in this view. Sab taiyaar hai — new orders appear here the moment they land.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-ivory/10">
          {shown.map((o, i) => {
            const open = openId === o.id;
            const p = profiles[o.user_id];
            const actions = NEXT_ACTIONS[o.status] || [];
            const latestProof = open ? proofs[0] : undefined;
            return (
              <div key={o.id} className={i % 2 ? "bg-white/[0.02]" : ""}>
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  data-cursor="link"
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-left md:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-xs text-ivory/50">{o.order_no}</span>
                    <StatusChip status={o.status} />
                    <span className="hidden truncate text-xs text-ivory/55 sm:inline">
                      {p?.full_name || "Customer"}{p?.username ? ` · @${p.username}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ivory/55">
                    <span className="font-serif text-base text-ivory">{inr(o.total_amount)}</span>
                    <span className="hidden md:inline">{dt(o.created_at)}</span>
                    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-ivory/[0.07] px-4 py-5 md:px-5">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                      {/* left: items + customer */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Items</h4>
                        <ul className="mt-2.5 space-y-2">
                          {items.map((it2) => (
                            <li key={it2.id} className="flex items-start justify-between gap-3 text-sm">
                              <div className="min-w-0">
                                <span className="text-ivory/85">{biText(it2.name)} <span className="text-ivory/45">× {it2.qty}</span></span>
                                {it2.options && (
                                  <p className="mt-0.5 text-[11px] text-ivory/40">
                                    {Object.entries(it2.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                                  </p>
                                )}
                                {it2.custom_upload_url && <p className="mt-0.5 text-[11px] text-gold-light">Custom photo attached</p>}
                              </div>
                              <span className="shrink-0 text-ivory/70">{inr(it2.line_total)}</span>
                            </li>
                          ))}
                        </ul>

                        <h4 className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Customer</h4>
                        <p className="mt-2 text-sm text-ivory/80">
                          {p?.full_name || "—"}{p?.phone ? ` · ${p.phone}` : ""}
                          {p?.username && <span className="text-ivory/45"> · @{p.username}</span>}
                        </p>
                        <p className="mt-1 text-xs text-ivory/50">
                          {o.delivery_method === "local_delivery" ? "Raebareli local delivery" : "Shop pickup"}
                          {o.delivery_address?.line ? ` — ${o.delivery_address.line}` : ""}
                        </p>
                        {(() => {
                          const phone = o.delivery_address?.phone || p?.phone || null;
                          const link = waLink(phone, orderStatusMessage(o));
                          return link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              data-cursor="link"
                              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#25D366] transition-colors hover:bg-[#25D366]/25"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                                <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35M12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97.99-3.62-.23-.37a9.77 9.77 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.83-9.8a9.76 9.76 0 0 1 6.94 2.88 9.76 9.76 0 0 1 2.87 6.95c0 5.4-4.4 9.79-9.81 9.79m8.35-18.15A11.76 11.76 0 0 0 12.04 0C5.5 0 .19 5.3.19 11.85c0 2.09.54 4.13 1.58 5.93L.09 24l6.35-1.66a11.8 11.8 0 0 0 5.6 1.43h.01c6.55 0 11.86-5.3 11.86-11.85 0-3.17-1.24-6.15-3.5-8.27" />
                              </svg>
                              WhatsApp — {ORDER_STATUS[o.status]?.en || o.status}
                            </a>
                          ) : (
                            <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ivory/35">
                              No phone on file for WhatsApp
                            </p>
                          );
                        })()}
                        {o.customer_note && <p className="mt-2 rounded-lg bg-white/[0.04] p-3 text-xs text-ivory/60">“{o.customer_note}”</p>}

                        <label className="mt-5 block">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Admin note</span>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={2}
                            placeholder="Internal note for this order…"
                            className="mt-2 w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
                          />
                        </label>
                      </div>

                      {/* right: payment proof */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Payment proof</h4>
                        {proofs.length === 0 ? (
                          <p className="mt-2.5 text-xs text-ivory/45">No screenshot uploaded yet.</p>
                        ) : (
                          <div className="mt-2.5 space-y-2.5">
                            {proofs.map((pr) => (
                              <div key={pr.id} className="rounded-xl border border-ivory/10 bg-white/[0.03] p-3.5">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                                    pr.status === "approved" ? "bg-leaf/15 text-leaf" : pr.status === "rejected" ? "bg-red-500/15 text-red-300" : "bg-gold/15 text-gold-light"
                                  }`}>{pr.status}</span>
                                  <span className="text-[10px] text-ivory/40">{dt(pr.created_at)}</span>
                                  {pr.utr && <span className="font-mono text-[10px] text-ivory/60">UTR {pr.utr}</span>}
                                </div>
                                <button
                                  onClick={() => viewProof(pr)}
                                  disabled={busy === pr.id}
                                  data-cursor="link"
                                  className="mt-2.5 rounded-full border border-gold/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-light hover:bg-gold/10"
                                >
                                  {busy === pr.id ? "Loading…" : "View screenshot"}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {o.status === "payment_verifying" && (
                          <div className="mt-4">
                            <label className="block">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300/80">If rejecting — reason</span>
                              <input
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                placeholder="e.g. screenshot unclear / amount mismatch"
                                className="mt-2 w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-red-400/60 focus:outline-none"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-ivory/[0.07] pt-4">
                      {actions.map((a) => (
                        <button
                          key={a.to}
                          onClick={() => moveStatus(o, a.to)}
                          disabled={busy === o.id + a.to}
                          data-cursor="link"
                          className={`rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                            a.strong
                              ? "bg-gold text-ink hover:bg-gold-light"
                              : a.to === "cancelled" || a.to === "payment_rejected"
                                ? "border border-red-400/40 text-red-200 hover:bg-red-500/10"
                                : "border border-ivory/20 text-ivory/80 hover:border-gold/50 hover:text-gold-light"
                          } disabled:opacity-50`}
                        >
                          {busy === o.id + a.to ? "…" : a.label}
                        </button>
                      ))}
                      {actions.length === 0 && (
                        <span className="text-[11px] uppercase tracking-[0.14em] text-ivory/35">No further actions</span>
                      )}
                      <a
                        href={`/admin/invoice/${o.id}`}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="link"
                        className="ml-auto rounded-full border border-ivory/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:border-gold/50 hover:text-gold-light"
                      >
                        🧾 Print bill
                      </a>
                      {latestProof && o.status === "payment_verifying" && (
                        <span className="ml-auto self-center text-[10px] text-ivory/40">
                          Review the screenshot, then approve or reject.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* proof lightbox */}
      {proofImg && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-5 backdrop-blur-sm"
          onClick={() => { URL.revokeObjectURL(proofImg); setProofImg(null); }}
        >
          <img src={proofImg} alt="UPI payment proof" className="max-h-[86vh] max-w-full rounded-lg border border-gold/30 object-contain" />
        </div>
      )}
    </section>
  );
}
