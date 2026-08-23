"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { errMsg } from "@/components/providers/auth-provider";
import { publicStorageUrl } from "@/lib/admin-shared";

type Payments = { upi_vpa?: string; payee_name?: string; upi_qr_url?: string };
type Shop = { announcement_en?: string; announcement_hi?: string };

const inputCls =
  "w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none";
const labelCls = "text-[10px] font-bold uppercase tracking-[0.18em] text-gold block mb-1.5";
const cardCls = "rounded-2xl border border-ivory/10 bg-white/[0.03] p-5 md:p-6";

export default function SettingsAdmin() {
  const [pay, setPay] = useState<Payments>({ upi_vpa: "", payee_name: "Quality Glass Emporium", upi_qr_url: "" });
  const [shop, setShop] = useState<Shop>({ announcement_en: "", announcement_hi: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const qrRef = useRef<HTMLInputElement>(null);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getInsforge().database.from("site_settings").select("key, value");
        const rows = (data || []) as { key: string; value: Record<string, unknown> }[];
        const p = rows.find((r) => r.key === "payments");
        if (p?.value) setPay({ upi_vpa: "", payee_name: "Quality Glass Emporium", upi_qr_url: "", ...p.value } as Payments);
        const s = rows.find((r) => r.key === "shop");
        if (s?.value) setShop(s.value as unknown as Shop);
      } catch (e) { setErr(errMsg(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  const saveSetting = useCallback(async (key: string, value: Record<string, unknown>) => {
    const db = getInsforge().database;
    const { data } = await db.from("site_settings").select("key").eq("key", key);
    const exists = Array.isArray(data) && data.length > 0;
    if (exists) {
      const { error } = await db.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
      if (error) throw new Error(errMsg(error));
    } else {
      const { error } = await db.from("site_settings").insert([{ key, value }]);
      if (error) throw new Error(errMsg(error));
    }
  }, []);

  const savePay = useCallback(async () => {
    setBusy("pay"); setErr("");
    try {
      if (pay.upi_vpa && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(pay.upi_vpa.trim()))
        throw new Error("UPI ID looks off — should look like name@bank (e.g. ajmal@ybl).");
      await saveSetting("payments", {
        upi_vpa: pay.upi_vpa?.trim() || "",
        payee_name: pay.payee_name?.trim() || "Quality Glass Emporium",
        upi_qr_url: pay.upi_qr_url || "",
      });
      toastMsg("Payment settings saved ✓ — checkout QR/VPA updated instantly.");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(""); }
  }, [pay, saveSetting]);

  const saveShop = useCallback(async () => {
    setBusy("shop"); setErr("");
    try {
      await saveSetting("shop", {
        announcement_en: shop.announcement_en?.trim() || "",
        announcement_hi: shop.announcement_hi?.trim() || "",
      });
      toastMsg("Announcement saved ✓");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(""); }
  }, [shop, saveSetting]);

  const uploadQr = useCallback(async (file: File) => {
    setBusy("qr"); setErr("");
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error("Max 4MB image.");
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const key = `upi-qr-${Date.now()}.${ext}`;
      const up = await getInsforge().storage.from("content").upload(key, file);
      if (up.error) throw new Error(errMsg(up.error));
      setPay((p) => ({ ...p, upi_qr_url: publicStorageUrl("content", key) }));
      toastMsg("QR uploaded — press Save payment settings to publish.");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(""); if (qrRef.current) qrRef.current.value = ""; }
  }, []);

  if (loading) return <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.25em] text-ivory/40">Loading settings…</p>;

  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-2">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-leaf/50 bg-ink px-5 py-2.5 text-xs font-semibold text-leaf shadow-xl">{toast}</div>
      )}
      {err && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3.5 text-xs text-red-200 lg:col-span-2">
          {err} <button className="float-right underline" onClick={() => setErr("")}>dismiss</button>
        </div>
      )}

      {/* payments */}
      <div className={cardCls}>
        <h3 className="font-serif text-xl text-ivory">UPI Payments · भुगतान</h3>
        <p className="mt-1 text-xs leading-5 text-ivory/45">Shown on the checkout payment screen. Customers pay this VPA/QR and upload a screenshot for your approval.</p>
        <div className="mt-5 grid gap-4">
          <div>
            <span className={labelCls}>UPI ID (VPA)</span>
            <input className={inputCls} value={pay.upi_vpa || ""} onChange={(e) => setPay({ ...pay, upi_vpa: e.target.value })} placeholder="ajmal@okhdfcbank" />
          </div>
          <div>
            <span className={labelCls}>Payee name</span>
            <input className={inputCls} value={pay.payee_name || ""} onChange={(e) => setPay({ ...pay, payee_name: e.target.value })} placeholder="Quality Glass Emporium" />
          </div>
          <div>
            <span className={labelCls}>QR code image</span>
            <div className="flex items-center gap-4">
              <div className="gold-frame h-28 w-28 shrink-0 rounded-[2px] p-[5px]">
                <div className="flex h-full w-full items-center justify-center border border-gold/15 bg-ink">
                  {pay.upi_qr_url
                    ? <img src={pay.upi_qr_url} alt="UPI QR" className="h-full w-full object-contain" />
                    : <span className="px-2 text-center text-[9px] uppercase tracking-[0.12em] text-ivory/30">No QR yet</span>}
                </div>
              </div>
              <button onClick={() => qrRef.current?.click()} disabled={busy === "qr"} data-cursor="link"
                className="rounded-full border border-gold/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-light hover:bg-gold/10 disabled:opacity-50">
                {busy === "qr" ? "Uploading…" : pay.upi_qr_url ? "Replace QR" : "Upload QR"}
              </button>
              <input ref={qrRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadQr(f); }} />
            </div>
          </div>
          <button onClick={savePay} disabled={busy === "pay"} data-cursor="link"
            className="w-fit rounded-full bg-gold px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink hover:bg-gold-light disabled:opacity-50">
            {busy === "pay" ? "Saving…" : "Save payment settings"}
          </button>
        </div>
      </div>

      <div className="grid content-start gap-5">
        {/* announcement */}
        <div className={cardCls}>
          <h3 className="font-serif text-xl text-ivory">Shop announcement</h3>
          <p className="mt-1 text-xs leading-5 text-ivory/45">The little golden strip / tagline shown around the site header.</p>
          <div className="mt-5 grid gap-4">
            <div>
              <span className={labelCls}>English</span>
              <input className={inputCls} value={shop.announcement_en || ""} onChange={(e) => setShop({ ...shop, announcement_en: e.target.value })} />
            </div>
            <div>
              <span className={labelCls}>हिंदी</span>
              <input className={inputCls} value={shop.announcement_hi || ""} onChange={(e) => setShop({ ...shop, announcement_hi: e.target.value })} />
            </div>
            <button onClick={saveShop} disabled={busy === "shop"} data-cursor="link"
              className="w-fit rounded-full bg-gold px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink hover:bg-gold-light disabled:opacity-50">
              {busy === "shop" ? "Saving…" : "Save announcement"}
            </button>
          </div>
        </div>

        {/* shop contact note */}
        <div className={cardCls}>
          <h3 className="font-serif text-xl text-ivory">Contact info</h3>
          <p className="mt-2 text-xs leading-5 text-ivory/50">
            Phone / WhatsApp (<span className="text-ivory/75">+91 83031 08051</span>) and the shop address lives in the site&apos;s
            code config — tell me any change and I&apos;ll update it for you.
          </p>
        </div>

        {/* security summary */}
        <div className={`${cardCls} border-leaf/25`}>
          <h3 className="font-serif text-xl text-ivory">Security · सुरक्षा</h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-ivory/55">
            <li className="flex gap-2"><span className="text-leaf">✓</span> Every table protected by row-level security — customers only ever see their own orders.</li>
            <li className="flex gap-2"><span className="text-leaf">✓</span> The project master key never reaches browsers; all traffic goes through this site&apos;s allow-list proxy.</li>
            <li className="flex gap-2"><span className="text-leaf">✓</span> Anonymous visitors can only read the live catalog — drafts, unapproved reviews and private payment proofs are invisible.</li>
            <li className="flex gap-2"><span className="text-leaf">✓</span> Only this owner account (<span className="text-gold-light">@owneajmal69</span>) can write products, settings, promos and reviews.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
