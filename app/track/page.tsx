"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { biText, inr, dt, publicStorageUrl } from "@/lib/admin-shared";
import { getInsforge } from "@/lib/insforge/client";

type TrackedItem = { name: unknown; qty: number; options: Record<string, string> | null };
type TrackedOrder = {
  order_no: string;
  status: string;
  total_amount: number | string;
  delivery_method: string;
  created_at: string;
  updated_at: string;
  items: TrackedItem[];
  rejectReason: string | null;
};

type Step = { en: string; hi: string; state: "done" | "now" | "wait" | "fail" };

function timeline(o: TrackedOrder): Step[] {
  const s = o.status;
  if (s === "cancelled") {
    return [
      { en: "Order placed", hi: "ऑर्डर हुआ", state: "done" },
      { en: "Cancelled", hi: "रद्द", state: "fail" },
    ];
  }

  const steps: Step[] = [{ en: "Order placed", hi: "ऑर्डर हुआ", state: "done" }];

  // payment
  if (s === "payment_pending") steps.push({ en: "Awaiting payment", hi: "भुगतान बाकी", state: "now" });
  else if (s === "payment_verifying") steps.push({ en: "Verifying payment", hi: "भुगतान जाँच जारी", state: "now" });
  else if (s === "payment_rejected") steps.push({ en: "Payment rejected — re-upload", hi: "भुगतान अस्वीकृत", state: "fail" });
  else steps.push({ en: "Payment confirmed", hi: "भुगतान पक्का", state: "done" });

  // production
  const productionPassed = ["ready_for_pickup", "out_for_delivery", "completed"].includes(s);
  if (s === "paid" || s === "in_production") steps.push({ en: "In production", hi: "बन रहा है", state: "now" });
  else steps.push({ en: "In production", hi: "बन रहा है", state: productionPassed ? "done" : "wait" });

  // handover
  if (s === "ready_for_pickup") steps.push({ en: "Ready for pickup", hi: "पिकअप तैयार", state: "now" });
  else if (s === "out_for_delivery") steps.push({ en: "Out for delivery", hi: "डिलीवरी पर", state: "now" });
  else if (s === "completed") steps.push({ en: o.delivery_method === "local_delivery" ? "Delivered" : "Picked up", hi: "सौंप दिया गया", state: "done" });
  else steps.push({ en: o.delivery_method === "local_delivery" ? "Delivery" : "Pickup", hi: "डिलीवरी / पिकअप", state: "wait" });

  if (s === "completed") steps.push({ en: "Completed", hi: "पूरा हुआ", state: "done" });
  return steps;
}

function StepIcon({ state }: { state: Step["state"] }) {
  if (state === "done")
    return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">✓</span>;
  if (state === "fail")
    return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">✕</span>;
  if (state === "now")
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold bg-gold/15">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" />
      </span>
    );
  return <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/20 text-ivory/25">·</span>;
}

/** Photo review form — shown only for completed orders. */
function ReviewForm({ orderNo, phone }: { orderNo: string; phone: string }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const hpRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const startedAt = useRef<number>(Date.now());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      // optional photo → public content bucket
      let photoUrl: string | null = null;
      let photoKey: string | null = null;
      const file = fileRef.current?.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Photo is larger than 5 MB.");
        if (!/^image\//.test(file.type)) throw new Error("Only image files are allowed.");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        photoKey = `review-${orderNo}-${Date.now()}.${ext}`;
        const up = await getInsforge().storage.from("content").upload(photoKey, file);
        if (up.error) throw new Error("Photo upload failed — try again without the photo.");
        photoUrl = publicStorageUrl("content", photoKey);
      }
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo, phone,
          authorName: name.trim(),
          area: area.trim(),
          rating,
          quote: quote.trim(),
          photoUrl, photoKey,
          website: hpRef.current?.value ?? "",
          _t: startedAt.current,
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || "Something went wrong — please try again.");
      setMsg({ ok: true, text: out.message || "Thank you! Your review is with the owner for approval." });
      setQuote(""); setArea("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong — please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-2xl border border-gold/30 bg-gold/[0.04] p-6 md:p-8"
    >
      {/* honeypot — invisible to humans, irresistible to bots */}
      <input
        ref={hpRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Rate your order · अपना अनुभव बताएं</p>
      <p className="mt-2 text-xs leading-5 text-ivory/50">
        Loved your frame? Drop a few words (and a photo!) — it helps neighbours find honest work.
      </p>

      <div className="mt-4 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            data-cursor="link"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? "text-gold-light" : "text-ivory/20"}`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          placeholder="Your name · आपका नाम"
          className="w-full rounded-xl border border-ivory/15 bg-ink/50 px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/60 focus:outline-none"
        />
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          maxLength={60}
          placeholder="Locality (optional) · इलाका"
          className="w-full rounded-xl border border-ivory/15 bg-ink/50 px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/60 focus:outline-none"
        />
      </div>
      <textarea
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        required
        minLength={5}
        maxLength={800}
        rows={3}
        placeholder="How did the frame turn out? · फ्रेम कैसा लगा?"
        className="mt-3 w-full rounded-xl border border-ivory/15 bg-ink/50 px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/60 focus:outline-none"
      />
      <label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-ivory/20 px-4 py-3 text-xs text-ivory/50 transition-colors hover:border-gold/50 hover:text-ivory/80">
        📷 Attach a photo of your frame (optional, up to 5 MB)
        <input ref={fileRef} type="file" accept="image/*" className="hidden" />
      </label>
      {fileRef.current?.files?.[0] && (
        <p className="mt-1.5 text-[11px] text-gold-light">{fileRef.current.files[0].name}</p>
      )}

      {msg && (
        <p className={`mt-4 rounded-xl border p-3.5 text-xs leading-5 ${msg.ok ? "border-leaf/40 bg-leaf/10 text-leaf" : "border-red-400/40 bg-red-500/10 text-red-200"}`}>
          {msg.text}
        </p>
      )}
      {msg?.ok ? null : (
        <button
          type="submit"
          disabled={busy}
          data-cursor="link"
          className="mt-4 w-full rounded-full bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-all hover:bg-gold-light disabled:opacity-50"
        >
          {busy ? "Sending… · भेज रहे हैं" : "Post review · रिव्यू भेजें"}
        </button>
      )}
    </form>
  );
}

export default function TrackPage() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");

  // listing #1: prefill order number from the WhatsApp track link (/track?o=QG-XXXXXX)
  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get("o");
    if (o) setOrderNo(o.trim().toUpperCase());
  }, []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  // bot shield: honeypot + form-load timestamp (verified server-side)
  const hpRef = useRef<HTMLInputElement | null>(null);
  const startedAt = useRef<number>(Date.now());

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(""); setOrder(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: orderNo.trim(),
          phone: phone.trim(),
          website: hpRef.current?.value ?? "",
          _t: startedAt.current,
        }),
      });
      const out = await res.json().catch(() => ({} as { ok?: boolean; error?: string; order?: TrackedOrder }));
      if (!res.ok || !out.ok || !out.order) throw new Error(out.error || "Could not find that order.");
      setOrder(out.order);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const steps = order ? timeline(order) : [];

  return (
    <main className="min-h-[100svh] px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-xl">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
          Quality Glass Emporium · Raebareli
        </p>
        <h1 className="mt-4 text-center font-serif text-4xl text-ivory md:text-5xl">
          Track your order <span className="block text-2xl text-ivory/50 md:text-3xl">ऑर्डर ट्रैक करें</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-6 text-ivory/50">
          Enter your order number and the phone number used while ordering — no login needed.{" "}
          <span className="text-ivory/35">ऑर्डर नंबर और फ़ोन नंबर डालें — लॉगिन ज़रूरी नहीं।</span>
        </p>

        <form onSubmit={lookup} className="mt-10 space-y-4">
          {/* honeypot — invisible to humans, irresistible to bots */}
          <input
            ref={hpRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
          />
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
              Order number · ऑर्डर नंबर
            </label>
            <input
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="QG-5X7K2LA"
              autoCapitalize="characters"
              className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 font-mono text-sm uppercase tracking-wider text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
              Phone number · फ़ोन नंबर
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            data-cursor="link"
            className="w-full rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {busy ? "Checking… · जाँच हो रही है" : "Track order · ट्रैक करें"}
          </button>
        </form>

        {err && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-xs leading-5 text-red-200">
            {err}
          </div>
        )}

        {order && (
          <div className="mt-10 rounded-2xl border border-gold/25 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">Order</p>
                <p className="font-serif text-2xl text-gold-light">{order.order_no}</p>
                <p className="mt-1 text-[11px] text-ivory/40">Placed {dt(order.created_at)}</p>
              </div>
              <p className="font-serif text-2xl text-ivory">{inr(order.total_amount)}</p>
            </div>

            {order.status === "cancelled" && (
              <p className="mt-5 rounded-xl border border-red-400/25 bg-red-500/[0.07] p-4 text-xs leading-5 text-red-200/90">
                This order was cancelled. ज़रूरत होने पर दोबारा ऑर्डर करें — we’d love to serve you again.
              </p>
            )}
            {order.status === "payment_rejected" && (
              <div className="mt-5 rounded-xl border border-red-400/25 bg-red-500/[0.07] p-4 text-xs leading-5 text-red-200/90">
                Payment couldn’t be verified{order.rejectReason ? ` — ${order.rejectReason}` : ""}. Please sign in →
                My Account → upload a fresh screenshot.{" "}
                <Link href="/login" data-cursor="link" className="font-semibold text-gold-light underline">
                  Sign in to re-upload
                </Link>
              </div>
            )}
            {order.status === "payment_pending" && (
              <div className="mt-5 rounded-xl border border-gold/30 bg-gold/[0.07] p-4 text-xs leading-5 text-gold-light/90">
                Payment is still pending — pay via the UPI QR and upload your screenshot.{" "}
                <Link href="/login" data-cursor="link" className="font-semibold underline">
                  Continue payment
                </Link>
              </div>
            )}

            {/* timeline */}
            <div className="mt-8 space-y-0">
              {steps.map((s, i) => (
                <div key={s.en} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <StepIcon state={s.state} />
                    {i < steps.length - 1 && <span className={`w-px flex-1 ${s.state === "done" ? "bg-gold/50" : "bg-ivory/15"}`} />}
                  </div>
                  <div className={`pb-7 pt-1 ${s.state === "wait" ? "opacity-40" : ""}`}>
                    <p className={`text-sm font-semibold ${s.state === "now" ? "text-gold-light" : s.state === "done" ? "text-ivory/85" : s.state === "fail" ? "text-red-300" : "text-ivory/45"}`}>
                      {s.en}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ivory/40">{s.hi}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* items */}
            <div className="mt-2 border-t border-ivory/10 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Your items · आपके आइटम</p>
              <ul className="mt-3 space-y-2">
                {order.items.map((it, i) => (
                  <li key={i} className="text-sm text-ivory/75">
                    {biText(it.name as never)} <span className="text-ivory/40">× {it.qty}</span>
                    {it.options && (
                      <span className="block text-[11px] text-ivory/40">
                        {Object.entries(it.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-ivory/40">
                {order.delivery_method === "local_delivery" ? "🛵 Raebareli local delivery" : "🏪 Pickup from shop"}
                {" · "}Questions? WhatsApp us — we reply fast.
              </p>
            </div>
          </div>
        )}

        {order && order.status === "completed" && (
          <ReviewForm orderNo={order.order_no} phone={phone} />
        )}

        <p className="mt-12 text-center text-[11px] text-ivory/30">
          <Link href="/shop" data-cursor="link" className="transition-colors hover:text-gold-light">
            ← Back to shop
          </Link>
        </p>
      </div>
    </main>
  );
}
