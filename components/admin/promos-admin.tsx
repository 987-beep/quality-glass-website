"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { errMsg } from "@/components/providers/auth-provider";
import { Promo, biText, publicStorageUrl } from "@/lib/admin-shared";
import CouponsAdmin from "@/components/admin/coupons-admin";

type Blank = {
  id: string | null;
  title_en: string; title_hi: string;
  image_url: string; link: string;
  position: string; sort: number; is_active: boolean;
};

const EMPTY: Blank = { id: null, title_en: "", title_hi: "", image_url: "", link: "", position: "home_top", sort: 0, is_active: true };

const inputCls =
  "w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none";
const labelCls = "text-[10px] font-bold uppercase tracking-[0.18em] text-gold block mb-1.5";

export default function PromosAdmin() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [edit, setEdit] = useState<Blank | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const { data, error } = await getInsforge().database.from("promos").select("*").order("sort", { ascending: true });
    if (error) throw new Error(errMsg(error));
    setPromos((data || []) as Promo[]);
  }, []);

  useEffect(() => { load().catch((e) => setErr(errMsg(e))).finally(() => setLoading(false)); }, [load]);

  const openEdit = useCallback((p?: Promo) => {
    setErr("");
    if (!p) { setEdit({ ...EMPTY, sort: promos.length + 1 }); return; }
    setEdit({
      id: p.id, title_en: p.title?.en || "", title_hi: p.title?.hi || "",
      image_url: p.image_url || "", link: p.link || "",
      position: p.position || "home_top", sort: p.sort ?? 0, is_active: p.is_active,
    });
  }, [promos]);

  const save = useCallback(async () => {
    if (!edit) return;
    setBusy(true); setErr("");
    try {
      const titleEn = edit.title_en.trim();
      if (!titleEn) throw new Error("Banner title (English) is required.");
      if (!edit.image_url.trim()) throw new Error("Add a banner image (upload or URL).");
      const payload = {
        title: { en: titleEn, hi: edit.title_hi.trim() || titleEn },
        image_url: edit.image_url.trim(),
        link: edit.link.trim() || null,
        position: edit.position,
        sort: edit.sort,
        is_active: edit.is_active,
      };
      const db = getInsforge().database;
      if (edit.id) {
        const { error } = await db.from("promos").update(payload).eq("id", edit.id);
        if (error) throw new Error(errMsg(error));
      } else {
        const { error } = await db.from("promos").insert([payload]);
        if (error) throw new Error(errMsg(error));
      }
      await load();
      setEdit(null);
      toastMsg("Promotion saved ✓");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  }, [edit, load]);

  const del = useCallback(async (id: string) => {
    setBusy(true); setErr("");
    try {
      const { error } = await getInsforge().database.from("promos").delete().eq("id", id);
      if (error) throw new Error(errMsg(error));
      setConfirmDel(null);
      await load();
      toastMsg("Promotion deleted");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  }, [load]);

  const uploadImage = useCallback(async (file: File) => {
    if (!edit) return;
    setBusy(true); setErr("");
    try {
      if (file.size > 6 * 1024 * 1024) throw new Error("Max 6MB image.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const key = `promo-banner-${Date.now()}.${ext}`;
      const up = await getInsforge().storage.from("content").upload(key, file);
      if (up.error) throw new Error(errMsg(up.error));
      setEdit({ ...edit, image_url: publicStorageUrl("content", key) });
      toastMsg("Banner image uploaded ✓");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); if (imgRef.current) imgRef.current.value = ""; }
  }, [edit]);

  if (loading) return <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.25em] text-ivory/40">Loading promotions…</p>;

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

      <div className="flex items-center gap-3">
        <p className="text-xs leading-5 text-ivory/45">Homepage offers & festive banners. Only “Live” ones show on the website.</p>
        <button onClick={() => openEdit()} data-cursor="link"
          className="ml-auto rounded-full bg-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink hover:bg-gold-light">
          + New promotion
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {promos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gold/25 bg-white/[0.02] p-10 text-center text-sm text-ivory/50">
            No promotions yet — add one for Diwali, New Year, or a launch offer.
          </div>
        )}
        {promos.map((p) => (
          <div key={p.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border p-3.5 md:p-4 ${p.is_active ? "border-ivory/10 bg-white/[0.03]" : "border-red-400/20 bg-red-500/[0.03]"}`}>
            {p.image_url && <img src={p.image_url} alt="" className="h-12 w-20 rounded-lg border border-gold/20 object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ivory">{biText(p.title)}</p>
              <p className="mt-0.5 text-[11px] text-ivory/45">{p.position} · sort {p.sort}{p.link ? ` · → ${p.link}` : ""}</p>
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${p.is_active ? "border-leaf/40 text-leaf" : "border-red-400/30 text-red-300"}`}>
              {p.is_active ? "Live" : "Hidden"}
            </span>
            <button onClick={() => openEdit(p)} data-cursor="link"
              className="rounded-full bg-gold px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink hover:bg-gold-light">
              Edit
            </button>
            {confirmDel === p.id ? (
              <button onClick={() => del(p.id)} data-cursor="link"
                className="rounded-full bg-red-500 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Confirm?</button>
            ) : (
              <button onClick={() => { setConfirmDel(p.id); setTimeout(() => setConfirmDel(null), 4000); }} data-cursor="link"
                className="rounded-full border border-red-400/30 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/10">Delete</button>
            )}
          </div>
        ))}
      </div>

      {edit && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/92 p-4 backdrop-blur-sm md:p-10" onClick={() => setEdit(null)}>
          <div className="gold-frame w-full max-w-xl rounded-[2px] p-[8px]" onClick={(e) => e.stopPropagation()}>
            <div className="border border-gold/15 bg-ink-2 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-2xl text-ivory">{edit.id ? "Edit promotion" : "New promotion"}</h3>
                <button onClick={() => setEdit(null)} data-cursor="link" className="text-ivory/40 hover:text-gold-light">✕</button>
              </div>
              <div className="mt-6 grid gap-4">
                <div>
                  <span className={labelCls}>Title (English) *</span>
                  <input className={inputCls} value={edit.title_en} onChange={(e) => setEdit({ ...edit, title_en: e.target.value })} placeholder="Festive Sale — 20% off gold frames" />
                </div>
                <div>
                  <span className={labelCls}>Title (हिंदी)</span>
                  <input className={inputCls} value={edit.title_hi} onChange={(e) => setEdit({ ...edit, title_hi: e.target.value })} />
                </div>
                <div>
                  <span className={labelCls}>Banner image *</span>
                  <div className="flex items-center gap-3">
                    {edit.image_url && <img src={edit.image_url} alt="" className="h-16 w-28 rounded-lg border border-gold/20 object-cover" />}
                    <button onClick={() => imgRef.current?.click()} data-cursor="link"
                      className="rounded-full border border-gold/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-light hover:bg-gold/10">
                      {edit.image_url ? "Replace" : "Upload image"}
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  </div>
                  <input className={`${inputCls} mt-2`} value={edit.image_url} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} placeholder="…or paste an image URL" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={labelCls}>Link (optional)</span>
                    <input className={inputCls} value={edit.link} onChange={(e) => setEdit({ ...edit, link: e.target.value })} placeholder="/shop" />
                  </div>
                  <div>
                    <span className={labelCls}>Sort order</span>
                    <input className={inputCls} type="number" value={edit.sort} onChange={(e) => setEdit({ ...edit, sort: Number(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={labelCls}>Position</span>
                    <select className={inputCls} value={edit.position} onChange={(e) => setEdit({ ...edit, position: e.target.value })}>
                      <option value="home_top">Homepage hero strip</option>
                      <option value="home_strip">Homepage mid strip</option>
                    </select>
                  </div>
                  <label className="mt-5 flex items-center gap-2.5 text-sm text-ivory/75">
                    <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} className="h-4 w-4 accent-[#C9A24B]" />
                    Live on website
                  </label>
                </div>
              </div>
              <div className="mt-7 flex gap-3">
                <button onClick={save} disabled={busy} data-cursor="link"
                  className="rounded-full bg-gold px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink hover:bg-gold-light disabled:opacity-50">
                  {busy ? "Saving…" : "Save promotion"}
                </button>
                <button onClick={() => setEdit(null)} data-cursor="link"
                  className="rounded-full border border-ivory/15 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ivory/70 hover:border-gold hover:text-gold-light">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* listing #3: offer codes for the checkout coupon field */}
      <CouponsAdmin />
    </section>
  );
}
