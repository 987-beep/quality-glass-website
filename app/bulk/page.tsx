"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SHOP } from "@/lib/site-config";
import { waLink } from "@/lib/whatsapp";
import { getInsforge } from "@/lib/insforge/client";

const ADVANCE = 200; // listing #4: slot-booking advance for bulk/event jobs

const OCCASIONS = [
  { id: "wedding", en: "Wedding / Shaadi", icon: "💍" },
  { id: "school", en: "School / College function", icon: "🎓" },
  { id: "award", en: "Award ceremony / Samman", icon: "🏆" },
  { id: "corporate", en: "Office / bulk gifting", icon: "💼" },
  { id: "religious", en: "Religious event", icon: "🛕" },
  { id: "other", en: "Something else", icon: "✨" },
];

const NEEDS = [
  "Photo frames",
  "God frames (mandir)",
  "Certificates & samman-patra",
  "Posters",
  "Stickers",
  "Photo printing",
  "Glass & mirror work",
  "Other",
];

export default function BulkPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [qty, setQty] = useState("");
  const [needBy, setNeedBy] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [payments, setPayments] = useState<{ upi_vpa?: string; payee_name?: string }>({});

  // listing #4: load UPI settings only for the advance block (public settings)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getInsforge().database.from("site_settings").select("value").eq("key", "payments");
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.value) setPayments(row.value as { upi_vpa?: string; payee_name?: string });
      } catch { /* advance block simply stays hidden */ }
    })();
  }, []);

  const advanceUpiLink = useMemo(() => {
    if (!payments.upi_vpa) return "";
    const p = new URLSearchParams({
      pa: payments.upi_vpa,
      pn: payments.payee_name || SHOP.name,
      am: ADVANCE.toFixed(2),
      cu: "INR",
      tn: `Bulk advance — ${name.trim() || "event order"}`,
    });
    return `upi://pay?${p.toString()}`;
  }, [payments, name]);

  const toggleNeed = (n: string) =>
    setNeeds((xs) => (xs.includes(n) ? xs.filter((x) => x !== n) : [...xs, n]));

  const message = useMemo(() => {
    const lines = [
      "🧾 *Bulk / Event Enquiry — Website*",
      "",
      `👤 Name: ${name.trim()}`,
      `📞 Phone: ${phone.trim()}`,
      `🎉 Occasion: ${OCCASIONS.find((o) => o.id === occasion)?.en || "-"}`,
      `🖼 Needs: ${needs.join(", ") || "-"}`,
      `🔢 Quantity (approx): ${qty || "-"}`,
      needBy ? `📅 Needed by: ${needBy}` : null,
      note.trim() ? `📝 Note: ${note.trim()}` : null,
      "",
      "— sent from quality-glass-website.vercel.app/bulk",
    ];
    return lines.filter(Boolean).join("\n");
  }, [name, phone, occasion, needs, qty, needBy, note]);

  const link = waLink(SHOP.phoneHref, message);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Please tell us your name. · नाम लिखें");
    const digits = phone.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) return setErr("Enter a valid 10-digit mobile number. · सही 10-अंकों का मोबाइल नंबर डालें");
    if (!occasion) return setErr("Pick the occasion. · अवसर चुनें");
    if (needs.length === 0) return setErr("Select at least one thing you need. · कम से कम एक चीज़ चुनें");
    const q = Number(qty);
    if (!q || q < 5) return setErr("Quantity should be 5 or more for bulk pricing. · थोक के लिए संख्या 5 या अधिक हो");
    if (!link) return setErr("Something went wrong — please call us instead.");
    window.open(link, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <main className="min-h-[100svh] px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-xl">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
          {SHOP.name} · Raebareli
        </p>
        <h1 className="mt-4 text-center font-serif text-4xl text-ivory md:text-5xl">
          Bulk & event orders <span className="block text-2xl text-ivory/50 md:text-3xl">थोक / इवेंट ऑर्डर</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-ivory/50">
          Weddings, school functions, award ceremonies, office gifting — 10 frames or 200, tell us once
          and get special bulk pricing on WhatsApp.{" "}
          <span className="text-ivory/35">ज्यादा संख्या में ऑर्डर पर खास दाम — सीधे WhatsApp पर।</span>
        </p>

        {sent ? (
          /* ── success state ── */
          <div className="mt-10 rounded-2xl border border-leaf/40 bg-leaf/[0.07] p-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf font-serif text-2xl text-ink">✓</span>
            <h2 className="mt-5 font-serif text-2xl text-ivory">WhatsApp opened — just press Send ✅</h2>
            <p className="mt-3 text-sm leading-6 text-ivory/60">
              Your enquiry is pre-typed for us. We reply quickly in working hours ({SHOP.hours}).{" "}
              <span className="text-ivory/40">WhatsApp खुल गया है — बस Send दबाएँ।</span>
            </p>
            <div className="mt-5 rounded-xl border border-ivory/10 bg-ink p-4 text-left">
              <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/35">Your message preview</p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] leading-5 text-ivory/70">{message}</pre>
            </div>

            {/* listing #4: no-show-proof slot booking — optional ₹200 advance via UPI */}
            {advanceUpiLink && (
              <div className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.07] p-5 text-center">
                <p className="font-serif text-lg text-ivory">Reserve your slot · ₹{ADVANCE} advance</p>
                <p className="mt-2 text-xs leading-5 text-ivory/55">
                  Event dates fill fast. Pay a fully-adjustable ₹{ADVANCE} advance now — it comes off your final bill.{" "}
                  <span className="text-ivory/40">स्लॉट पक्का करें — ₹{ADVANCE} एडवांस (अंतिम बिल में घट जाएगा)।</span>
                </p>
                <a href={advanceUpiLink} data-cursor="link"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light">
                  Pay ₹{ADVANCE} advance (UPI) ▸
                </a>
                <p className="mt-2.5 text-[10px] text-ivory/35">
                  Opens your UPI app with {payments.payee_name || SHOP.name} · screenshot भेज देना WhatsApp पर
                </p>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              {link && (
                <a href={link} target="_blank" rel="noreferrer" data-cursor="link"
                  className="rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-opacity hover:opacity-90">
                  Open WhatsApp again
                </a>
              )}
              <a href={SHOP.phoneHref} data-cursor="link"
                className="rounded-full border border-ivory/15 px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light">
                Or call us: {SHOP.phoneDisplay}
              </a>
              <button onClick={() => setSent(false)} data-cursor="link"
                className="text-[11px] uppercase tracking-[0.16em] text-ivory/40 transition-colors hover:text-gold-light">
                ← Edit details
              </button>
            </div>
          </div>
        ) : (
          /* ── form ── */
          <form onSubmit={submit} className="mt-10 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Your name · नाम *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                  className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Mobile · मोबाइल *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit" inputMode="numeric"
                  className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Occasion · अवसर *</label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {OCCASIONS.map((o) => (
                  <button key={o.id} type="button" onClick={() => setOccasion(o.id)} data-cursor="link"
                    className={`rounded-xl border px-3 py-3 text-left text-[12px] font-semibold transition-colors ${
                      occasion === o.id ? "border-gold bg-gold/15 text-gold-light" : "border-ivory/15 text-ivory/60 hover:border-gold/40 hover:text-ivory"
                    }`}>
                    <span className="mr-1.5">{o.icon}</span>{o.en}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">What do you need? · क्या चाहिए? *</label>
              <div className="flex flex-wrap gap-2">
                {NEEDS.map((n) => (
                  <button key={n} type="button" onClick={() => toggleNeed(n)} data-cursor="link"
                    className={`rounded-full border px-4 py-2 text-[11px] font-semibold transition-colors ${
                      needs.includes(n) ? "border-gold bg-gold/15 text-gold-light" : "border-ivory/15 text-ivory/55 hover:border-gold/40 hover:text-ivory"
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Approx quantity · संख्या *</label>
                <input value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="e.g. 50" inputMode="numeric"
                  className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Needed by (optional)</label>
                <input value={needBy} onChange={(e) => setNeedBy(e.target.value)} type="date"
                  className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 text-sm text-ivory [color-scheme:dark] focus:border-gold/60 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Anything else? (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                placeholder="Sizes, budget per piece, design ideas…"
                className="w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none" />
            </div>

            {err && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3.5 text-center text-xs text-red-200">{err}</p>
            )}

            <button type="submit" data-cursor="link"
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-opacity hover:opacity-90">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" width="18" height="18">
                <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35M12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97.99-3.62-.23-.37a9.77 9.77 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.83-9.8a9.76 9.76 0 0 1 6.94 2.88 9.76 9.76 0 0 1 2.87 6.95c0 5.4-4.4 9.79-9.81 9.79m8.35-18.15A11.76 11.76 0 0 0 12.04 0C5.5 0 .19 5.3.19 11.85c0 2.09.54 4.13 1.58 5.93L.09 24l6.35-1.66a11.8 11.8 0 0 0 5.6 1.43h.01c6.55 0 11.86-5.3 11.86-11.85 0-3.17-1.24-6.15-3.5-8.27" />
              </svg>
              Send enquiry on WhatsApp
            </button>

            <p className="text-center text-[11px] leading-5 text-ivory/35">
              Nothing is sent without you pressing “Send” in WhatsApp — your details go only to the shop.
            </p>
          </form>
        )}

        <p className="mt-12 text-center text-[11px] text-ivory/30">
          <Link href="/shop" data-cursor="link" className="transition-colors hover:text-gold-light">
            ← Or browse the shop first
          </Link>
        </p>
      </div>
    </main>
  );
}
