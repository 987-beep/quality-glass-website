"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, errMsg } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { getInsforge } from "@/lib/insforge/client";
import { formatINR } from "@/lib/format";
import { SHOP } from "@/lib/site-config";
import { TONE_FRAME } from "@/components/shop/product-card";

type Step = "details" | "payment" | "done";

type Payments = { upi_vpa?: string; payee_name?: string; upi_qr_url?: string };

type DbOrder = {
  id: string;
  order_no: string;
  total_amount: number;
  status: string;
};

type DbOrderItem = { name: string; qty: number; line_total: number; options?: Record<string, string> | null };

const newOrderNo = () =>
  "QG-" + Date.now().toString(36).toUpperCase().slice(-6) +
  Math.floor(Math.random() * 36).toString(36).toUpperCase();

function CheckoutInner() {
  const { t, lang } = useLanguage();
  const auth = useAuth();
  const cart = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const resumeOrderId = params.get("order");

  const [step, setStep] = useState<Step>("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // details form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<"pickup" | "local_delivery">("pickup");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // order state
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [payments, setPayments] = useState<Payments>({});

  // proof state
  const [file, setFile] = useState<File | null>(null);
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);

  // prefill from profile
  useEffect(() => {
    if (auth.profile?.full_name) setName(auth.profile.full_name);
    if (auth.profile?.phone) setPhone(auth.profile.phone);
  }, [auth.profile]);

  // load payment settings (public)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getInsforge()
          .database.from("site_settings")
          .select("value")
          .eq("key", "payments");
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.value) setPayments(row.value as Payments);
      } catch {
        /* fallback: pay on pickup */
      }
    })();
  }, []);

  // resume an unpaid order (from account page)
  useEffect(() => {
    if (!resumeOrderId || !auth.user) return;
    (async () => {
      const db = getInsforge().database;
      const { data: o } = await db
        .from("orders")
        .select("id,order_no,total_amount,status")
        .eq("id", resumeOrderId);
      const row = (Array.isArray(o) ? o[0] : o) as DbOrder | undefined;
      if (!row?.id) return;
      setOrder(row);
      const { data: items } = await db
        .from("order_items")
        .select("name,qty,line_total,options")
        .eq("order_id", row.id);
      setOrderItems((items as DbOrderItem[]) ?? []);
      setStep("payment");
    })();
  }, [resumeOrderId, auth.user]);

  // guards
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace(`/login?next=/checkout${resumeOrderId ? `?order=${resumeOrderId}` : ""}`);
    }
  }, [auth.loading, auth.user, router, resumeOrderId]);

  const subtotal = cart.subtotal;
  const placeTotal = resumeOrderId ? order?.total_amount ?? subtotal : subtotal;

  const ordersCount = useMemo(
    () => (step !== "details" ? orderItems.reduce((n, i) => n + i.qty, 0) : cart.count),
    [step, orderItems, cart.count]
  );

  const placeOrder = useCallback(async () => {
    setError("");
    if (!name.trim()) {
      setError(t.checkout.name);
      return;
    }
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setError(t.checkout.phoneErr);
      return;
    }
    if (cart.items.length === 0) {
      setError(t.checkout.needCart);
      return;
    }
    setBusy(true);
    try {
      const db = getInsforge().database;
      await db
        .from("profiles")
        .update({ full_name: name.trim(), phone: digits })
        .eq("id", auth.user!.id);

      const orderNo = newOrderNo();
      const { data: od, error: oe } = await db.from("orders").insert([
        {
          user_id: auth.user!.id,
          order_no: orderNo,
          total_amount: subtotal,
          delivery_method: delivery,
          delivery_address: delivery === "local_delivery" ? address.trim() || null : null,
          customer_note: note.trim() || null,
        },
      ]);
      if (oe) throw new Error(errMsg(oe));

      const { data: read } = await db
        .from("orders")
        .select("id,order_no,total_amount,status")
        .eq("order_no", orderNo);
      const row = (Array.isArray(read) ? read[0] : read) as DbOrder | undefined;
      if (!row?.id) throw new Error("Order could not be read back.");

      const itemsPayload = cart.items.map((i) => ({
        order_id: row.id,
        product_id: i.product_id,
        name: i.name,
        options: Object.fromEntries(i.options.map((o) => [o.kind, o.label])),
        qty: i.qty,
        unit_price: i.unitPrice,
        line_total: i.unitPrice * i.qty,
      }));
      const { error: ie } = await db.from("order_items").insert(itemsPayload);
      if (ie) throw new Error(errMsg(ie));

      setOrder(row);
      setOrderItems(
        itemsPayload.map((i) => ({
          name: i.name,
          qty: i.qty,
          line_total: i.line_total,
          options: i.options,
        }))
      );
      cart.clear();
      setStep("payment");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }, [name, phone, address, note, delivery, cart, subtotal, auth.user, t]);

  const submitProof = useCallback(async () => {
    if (!order) return;
    setError("");
    if (!file) {
      setError(t.checkout.proofSub);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5MB image");
      return;
    }
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const key = `proof-${order.id}-${Date.now()}.${ext}`;
      const up = await getInsforge().storage
        .from("payment-proofs")
        .upload(key, file);
      if (up.error) throw new Error(errMsg(up.error));

      const { error: pe } = await getInsforge()
        .database.from("payment_proofs")
        .insert([
          {
            order_id: order.id,
            user_id: auth.user!.id,
            storage_key: key,
            utr: utr.trim() || null,
          },
        ]);
      if (pe) throw new Error(errMsg(pe));
      setStep("done");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }, [order, file, utr, auth.user, t]);

  const summaryRows = useMemo(() => {
    if (step !== "details") {
      return orderItems.map((i) => ({
        name: i.name,
        qty: i.qty,
        total: i.line_total,
        opt: i.options ? Object.values(i.options).join(" · ") : "",
      }));
    }
    return cart.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      total: i.unitPrice * i.qty,
      opt: i.options.map((o) => o.label).join(" · "),
    }));
  }, [step, orderItems, cart.items]);

  const upiLink = useMemo(() => {
    if (!payments.upi_vpa) return "";
    const q = new URLSearchParams({
      pa: payments.upi_vpa,
      pn: payments.payee_name || SHOP.name,
      cu: "INR",
      ...(placeTotal ? { am: placeTotal.toFixed(2) } : {}),
      ...(order ? { tn: order.order_no } : {}),
    });
    return `upi://pay?${q.toString()}`;
  }, [payments, placeTotal, order]);

  if (auth.loading || (!auth.user && typeof window !== "undefined")) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ivory/40">Loading…</p>
      </main>
    );
  }

  if (step === "done" && order) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5 py-24">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold font-serif text-3xl text-ink shadow-glowgold">
            ✓
          </span>
          <h1 className="mt-6 font-serif text-4xl text-ivory">{t.checkout.doneTitle}</h1>
          <p className="mt-4 text-sm leading-6 text-ivory/55">{t.checkout.doneSub}</p>
          <p className="mt-2 text-xs text-ivory/40">{t.checkout.verifying}</p>
          <div className="mt-6 rounded-xl border border-gold/25 bg-gold/[0.06] px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">{t.checkout.orderNo}</p>
            <p className="font-serif text-2xl text-gold-light">{order.order_no}</p>
            <p className="mt-1 text-sm text-ivory/60">{formatINR(order.total_amount)}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/account"
              data-cursor="link"
              className="rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light"
            >
              {t.checkout.viewOrders}
            </Link>
            <Link
              href="/shop"
              data-cursor="link"
              className="rounded-full border border-ivory/15 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
            >
              {t.checkout.backShop}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden pb-28 pt-28 md:pt-36">
      <div aria-hidden className="absolute -top-24 right-10 h-[380px] w-[380px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1100px] px-5 md:px-10">
        {/* steps */}
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em]">
          {[
            ["details", t.checkout.step1],
            ["payment", t.checkout.step2],
            ["done", t.checkout.step3],
          ].map(([id, label], i) => (
            <span key={id} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                (step === "details" && id === "details") || (step === "payment" && id !== "done") || step === "done"
                  ? (step === id || (step === "payment" && id === "details") || step === "done"
                      ? "border-gold bg-gold text-ink"
                      : "border-gold bg-gold/20 text-gold-light")
                  : "border-ivory/20 text-ivory/40"
              }`}>
                {i + 1}
              </span>
              <span className={step === id ? "text-gold-light" : "text-ivory/35"}>{label}</span>
              {i < 2 && <span className="h-px w-6 bg-ivory/15" />}
            </span>
          ))}
        </div>

        <h1 className="mt-5 font-serif text-4xl text-ivory md:text-6xl">{t.checkout.title}</h1>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-5 text-red-200">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          {/* left: current step */}
          <div>
            {step === "details" && cart.ready && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                    {t.checkout.name}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-ivory/15 bg-white/[0.04] px-4 py-3.5 text-sm text-ivory outline-none transition-colors focus:border-gold/70"
                    placeholder={t.checkout.name}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                    {t.checkout.phone}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ivory/50">
                      +91
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-ivory/15 bg-white/[0.04] py-3.5 pl-12 pr-4 text-sm text-ivory outline-none transition-colors focus:border-gold/70"
                      placeholder="83031 08051"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                    {t.checkout.delivery}
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["pickup", t.checkout.pickup, t.checkout.pickupNote],
                        ["local_delivery", t.checkout.homeDelivery, t.checkout.homeNote],
                      ] as const
                    ).map(([id, title, sub]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDelivery(id)}
                        data-cursor="link"
                        className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                          delivery === id
                            ? "border-gold bg-gold/10"
                            : "border-ivory/15 hover:border-gold/50"
                        }`}
                      >
                        <p className={`text-sm font-bold ${delivery === id ? "text-gold-light" : "text-ivory/80"}`}>
                          {title}
                        </p>
                        <p className="mt-1 text-[11px] text-ivory/45">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {delivery === "local_delivery" && (
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                      {t.checkout.address}
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-ivory/15 bg-white/[0.04] px-4 py-3.5 text-sm text-ivory outline-none transition-colors focus:border-gold/70"
                      placeholder={t.checkout.address}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                    {t.checkout.orderNote}
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-ivory/15 bg-white/[0.04] px-4 py-3.5 text-sm text-ivory outline-none transition-colors focus:border-gold/70"
                  />
                </div>

                <button
                  onClick={placeOrder}
                  disabled={busy || cart.items.length === 0}
                  data-cursor="link"
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />}
                  {busy ? t.checkout.placing : t.checkout.placeOrder} · {formatINR(subtotal)}
                </button>
              </div>
            )}

            {step === "payment" && order && (
              <div className="space-y-6">
                {/* pay box */}
                <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-ink-2 to-ink p-6 shadow-frame md:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
                    {t.checkout.payTitle}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-ivory/40">{t.checkout.payTo}</p>
                      <p className="mt-1 font-serif text-xl text-ivory">{payments.payee_name || SHOP.name}</p>
                      {payments.upi_vpa && (
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(payments.upi_vpa!);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1600);
                          }}
                          data-cursor="link"
                          className="mt-1 text-xs text-gold-light underline-offset-2 hover:underline"
                        >
                          {copied ? t.checkout.copied + " ✓" : `${payments.upi_vpa} — ${t.checkout.upiCopy}`}
                        </button>
                      )}
                    </div>
                    <p className="font-serif text-4xl text-gold-light md:text-5xl">
                      {formatINR(placeTotal)}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
                    {/* QR (uploaded by owner later) or tap-to-pay hint */}
                    <div className="flex h-[180px] w-[180px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gold/30 bg-white/[0.04] p-3 text-center">
                      {payments.upi_qr_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={payments.upi_qr_url} alt="UPI QR" className="max-h-full max-w-full rounded-md" />
                      ) : (
                        <div>
                          <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10 text-gold/60" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <path d="M14 14h3v3h-3zM20 14v1m-6 6h1m2 0h3v-3M17 20v1" />
                          </svg>
                          <p className="mt-2 px-1 text-[10px] leading-4 text-ivory/40">{t.checkout.qrHint}</p>
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-3">
                      {upiLink && (
                        <a
                          href={upiLink}
                          data-cursor="link"
                          className="flex items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light"
                        >
                          {t.checkout.upiOpen} · {formatINR(placeTotal)}
                        </a>
                      )}
                      <a
                        href={`https://wa.me/918303108051?text=${encodeURIComponent(
                          `Order ${order?.order_no} — I will pay at pickup.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="link"
                        className="flex items-center justify-center gap-2 rounded-full border border-ivory/15 px-7 py-3 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
                      >
                        {t.checkout.skip}
                      </a>
                    </div>
                  </div>
                </div>

                {/* proof upload */}
                <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6 md:p-8">
                  <p className="text-sm font-bold text-ivory">{t.checkout.proofTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-ivory/45">{t.checkout.proofSub}</p>

                  <label
                    data-cursor="link"
                    className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ivory/15 px-4 py-8 text-sm text-ivory/60 transition-colors hover:border-gold/50 hover:text-gold-light"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file ? (
                      <span className="font-semibold text-gold-light">{file.name} ✓</span>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
                          <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                        </svg>
                        {t.checkout.upload}
                      </>
                    )}
                  </label>

                  <div className="mt-4">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                      {t.checkout.utr}
                    </label>
                    <input
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      className="w-full rounded-xl border border-ivory/15 bg-white/[0.04] px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold/70"
                    />
                  </div>

                  <button
                    onClick={submitProof}
                    disabled={busy}
                    data-cursor="link"
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light disabled:opacity-50"
                  >
                    {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />}
                    {t.checkout.submitProof}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-ivory/35">{t.checkout.verifying}</p>
                </div>
              </div>
            )}
          </div>

          {/* right: summary */}
          <aside className="h-fit rounded-2xl border border-gold/20 bg-ink-2 p-6 shadow-frame md:p-7 lg:sticky lg:top-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/45">
              {t.checkout.summary} · {ordersCount}
            </p>
            <div className="mt-4 space-y-3">
              {summaryRows.map((i, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-ivory/85">
                      {i.name} <span className="text-ivory/40">× {i.qty}</span>
                    </p>
                    {i.opt && <p className="truncate text-[11px] text-ivory/35">{i.opt}</p>}
                  </div>
                  <p className="shrink-0 text-ivory/70">{formatINR(i.total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-4">
              <p className="text-sm text-ivory/60">{t.checkout.deliverTo}</p>
              <p className="font-serif text-2xl text-gold-light">{formatINR(placeTotal)}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-ivory/40">Loading…</p>
        </main>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
