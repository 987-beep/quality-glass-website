"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";
import { errMsg } from "@/components/providers/auth-provider";
import {
  Category, Product, ProductImage, FRAME_TONES, biText, inr, slugify, publicStorageUrl,
} from "@/lib/admin-shared";

type Blank = {
  id: string | null;
  slug: string;
  name_en: string; name_hi: string;
  desc_en: string; desc_hi: string;
  base_price: string;
  category_id: string;
  frame_tone: string;
  is_featured: boolean;
  is_active: boolean;
};

const EMPTY: Blank = {
  id: null, slug: "", name_en: "", name_hi: "", desc_en: "", desc_hi: "",
  base_price: "", category_id: "", frame_tone: "black", is_featured: false, is_active: true,
};

const inputCls =
  "w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none";
const labelCls = "text-[10px] font-bold uppercase tracking-[0.18em] text-gold block mb-1.5";

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<Blank | null>(null);
  const [editImages, setEditImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    const db = getInsforge().database;
    const [pr, im, ca] = await Promise.all([
      db.from("products").select("*").order("slug", { ascending: true }),
      db.from("product_images").select("*"),
      db.from("categories").select("id, slug, name").eq("is_active", true).order("sort", { ascending: true }),
    ]);
    if (pr.error) throw new Error(errMsg(pr.error));
    setProducts((pr.data || []) as Product[]);
    setImages((im.data || []) as ProductImage[]);
    setCats((ca.data || []) as Category[]);
  }, []);

  useEffect(() => { load().catch((e) => setErr(errMsg(e))).finally(() => setLoading(false)); }, [load]);

  const imgFor = useCallback(
    (id: string) => images.filter((i) => i.product_id === id).sort((a, b) => a.sort - b.sort)[0]?.url || "/images/hero-wedding.jpg",
    [images]
  );

  // listing #7: photo-pending badge — count real photos per product
  const photoCountFor = useCallback(
    (id: string) => images.filter((i) => i.product_id === id).length,
    [images]
  );
  const photoPendingCount = useMemo(
    () => products.filter((p) => photoCountFor(p.id) < 2).length,
    [products, photoCountFor]
  );

  const openEdit = useCallback((p?: Product) => {
    setErr("");
    if (!p) { setEdit({ ...EMPTY }); setEditImages([]); return; }
    setEdit({
      id: p.id, slug: p.slug,
      name_en: biText({ en: p.name?.en }), name_hi: p.name?.hi || "",
      desc_en: biText({ en: p.description?.en }), desc_hi: p.description?.hi || "",
      base_price: String(p.base_price), category_id: p.category_id,
      frame_tone: p.frame_tone || "black", is_featured: p.is_featured, is_active: p.is_active,
    });
    setEditImages(images.filter((i) => i.product_id === p.id).sort((a, b) => a.sort - b.sort));
  }, [images]);

  const save = useCallback(async () => {
    if (!edit) return;
    setBusy(true); setErr("");
    try {
      const nameEn = edit.name_en.trim();
      if (!nameEn) throw new Error("Product name (English) is required.");
      const price = Number(edit.base_price);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price in ₹.");
      const slug = edit.slug.trim() || slugify(nameEn);
      if (!edit.category_id) throw new Error("Pick a category.");
      const payload = {
        slug,
        name: { en: nameEn, hi: edit.name_hi.trim() || nameEn },
        description: { en: edit.desc_en.trim(), hi: edit.desc_hi.trim() || edit.desc_en.trim() },
        base_price: price,
        category_id: edit.category_id,
        frame_tone: edit.frame_tone,
        is_featured: edit.is_featured,
        is_active: edit.is_active,
        updated_at: new Date().toISOString(),
      };
      const db = getInsforge().database;
      if (edit.id) {
        const { error } = await db.from("products").update(payload).eq("id", edit.id);
        if (error) throw new Error(errMsg(error));
      } else {
        const { error } = await db.from("products").insert([payload]);
        if (error) throw new Error(errMsg(error));
        const { data } = await db.from("products").select("id").eq("slug", slug);
        const row = (Array.isArray(data) ? data[0] : data) as { id?: string } | undefined;
        setEdit({ ...edit, id: row?.id || null, slug });
      }
      await load();
      if (edit.id) { setEdit(null); toastMsg("Product saved ✓"); }
      else toastMsg("Product created ✓ — now add photos below.");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  }, [edit, load]);

  const toggle = useCallback(async (p: Product, field: "is_active" | "is_featured") => {
    try {
      const { error } = await getInsforge().database.from("products").update({ [field]: !p[field] }).eq("id", p.id);
      if (error) throw new Error(errMsg(error));
      setProducts((xs) => xs.map((x) => (x.id === p.id ? { ...x, [field]: !p[field] } : x)));
    } catch (e) { setErr(errMsg(e)); }
  }, []);

  const del = useCallback(async (id: string) => {
    setBusy(true); setErr("");
    try {
      const sdk = getInsforge();
      const token = (await sdk.getHttpClient().getValidAccessToken()) ?? "";
      const res = await fetch("/api/admin/delete-product",
        { method: "POST", headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) });
      const out = await res.json().catch(() => ({} as { ok?: boolean; error?: string }));
      if (!res.ok || !out.ok) throw new Error(out.error || `Delete failed (HTTP ${res.status})`);
      setConfirmDel(null);
      await load();
      toastMsg("Product deleted ✓");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  }, [load]);

  const uploadImage = useCallback(async (file: File) => {
    if (!edit?.id) { setErr("Save the product first, then upload photos."); return; }
    setBusy(true); setErr("");
    try {
      if (file.size > 6 * 1024 * 1024) throw new Error("Max 6MB per photo.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const key = `catalog-${edit.slug}-${Date.now()}.${ext}`;
      const sdk = getInsforge();
      const up = await sdk.storage.from("products").upload(key, file);
      if (up.error) throw new Error(errMsg(up.error));
      const nextSort = (editImages.reduce((m, x) => Math.max(m, x.sort), 0) || 0) + 1;
      const { error } = await sdk.database.from("product_images").insert([{
        product_id: edit.id,
        url: publicStorageUrl("products", key),
        storage_key: key,
        alt: edit.name_en,
        sort: nextSort,
      }]);
      if (error) throw new Error(errMsg(error));
      await load();
      const db = sdk.database;
      const { data } = await db.from("product_images").select("*").eq("product_id", edit.id);
      setEditImages(((data || []) as ProductImage[]).sort((a, b) => a.sort - b.sort));
      toastMsg("Photo uploaded ✓");
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }, [edit, editImages, load]);

  const removeImage = useCallback(async (img: ProductImage) => {
    if (!edit) return;
    setBusy(true); setErr("");
    try {
      const { error } = await getInsforge().database.from("product_images").delete().eq("id", img.id);
      if (error) throw new Error(errMsg(error));
      setEditImages((xs) => xs.filter((x) => x.id !== img.id));
      setImages((xs) => xs.filter((x) => x.id !== img.id));
    } catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  }, [edit]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.slug.includes(q) || biText(p.name).toLowerCase().includes(q));
  }, [products, query]);

  if (loading) return <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.25em] text-ivory/40">Loading products…</p>;

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

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="min-w-0 flex-1 rounded-full border border-ivory/15 bg-white/[0.03] px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/60 focus:outline-none md:max-w-xs"
        />
        <button
          onClick={() => openEdit()}
          data-cursor="link"
          className="rounded-full bg-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
        >
          + New product
        </button>
        {photoPendingCount > 0 && (
          <span className="ml-auto rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-light">
            📷 {photoPendingCount} need photos
          </span>
        )}
        <span className={`${photoPendingCount > 0 ? "" : "ml-auto "}text-[10px] uppercase tracking-[0.16em] text-ivory/35`}>{shown.length} products</span>
      </div>

      <div className="mt-5 grid gap-3">
        {shown.map((p) => (
          <div key={p.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border p-3.5 md:p-4 ${p.is_active ? "border-ivory/10 bg-white/[0.03]" : "border-red-400/20 bg-red-500/[0.03]"}`}>
            <img src={imgFor(p.id)} alt="" className="h-14 w-14 rounded-lg border border-gold/20 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ivory">{biText(p.name)}</p>
              <p className="mt-0.5 text-[11px] text-ivory/45">
                {p.slug} · {inr(p.base_price)} · {p.frame_tone}
                {!p.is_active && <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-300">hidden</span>}
                {photoCountFor(p.id) < 2 && (
                  <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold-light" title="This product has fewer than 2 photos — add more for the featured grid">
                    📷 {photoCountFor(p.id)}/2 photos
                  </span>
                )}
              </p>
            </div>
            <button onClick={() => toggle(p, "is_featured")} data-cursor="link" title="Featured toggle"
              className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${p.is_featured ? "border-gold bg-gold/15 text-gold-light" : "border-ivory/15 text-ivory/45 hover:text-ivory"}`}>
              {p.is_featured ? "★ Featured" : "☆ Feature"}
            </button>
            <button onClick={() => toggle(p, "is_active")} data-cursor="link" title="Active toggle"
              className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${p.is_active ? "border-leaf/40 text-leaf" : "border-red-400/30 text-red-300"}`}>
              {p.is_active ? "Live" : "Hidden"}
            </button>
            <button onClick={() => openEdit(p)} data-cursor="link"
              className="rounded-full bg-gold px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink hover:bg-gold-light">
              Edit
            </button>
            {confirmDel === p.id ? (
              <button onClick={() => del(p.id)} data-cursor="link"
                className="rounded-full bg-red-500 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white hover:bg-red-400">
                Confirm delete?
              </button>
            ) : (
              <button onClick={() => { setConfirmDel(p.id); setTimeout(() => setConfirmDel(null), 4000); }} data-cursor="link"
                className="rounded-full border border-red-400/30 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/10">
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* editor overlay */}
      {edit && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/92 p-4 backdrop-blur-sm md:p-10" onClick={() => setEdit(null)}>
          <div className="gold-frame w-full max-w-2xl rounded-[2px] p-[8px]" onClick={(e) => e.stopPropagation()}>
            <div className="border border-gold/15 bg-ink-2 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-2xl text-ivory">{edit.id ? "Edit product" : "New product"}</h3>
                <button onClick={() => setEdit(null)} data-cursor="link" className="text-ivory/40 hover:text-gold-light">✕</button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <span className={labelCls}>Name (English) *</span>
                  <input className={inputCls} value={edit.name_en} onChange={(e) => setEdit({ ...edit, name_en: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} placeholder="e.g. Naruto Uzumaki Frame" />
                </div>
                <div className="md:col-span-2">
                  <span className={labelCls}>Name (हिंदी)</span>
                  <input className={inputCls} value={edit.name_hi} onChange={(e) => setEdit({ ...edit, name_hi: e.target.value })} placeholder="हिंदी नाम (खाली छूटे तो English चलेगा)" />
                </div>
                <div>
                  <span className={labelCls}>Slug</span>
                  <input className={inputCls} value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} />
                </div>
                <div>
                  <span className={labelCls}>Price ₹ *</span>
                  <input className={inputCls} type="number" min="1" value={edit.base_price} onChange={(e) => setEdit({ ...edit, base_price: e.target.value })} placeholder="899" />
                </div>
                <div>
                  <span className={labelCls}>Category *</span>
                  <select className={inputCls} value={edit.category_id} onChange={(e) => setEdit({ ...edit, category_id: e.target.value })}>
                    <option value="">— pick —</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{biText(c.name)} ({c.slug})</option>)}
                  </select>
                </div>
                <div>
                  <span className={labelCls}>Frame tone</span>
                  <select className={inputCls} value={edit.frame_tone} onChange={(e) => setEdit({ ...edit, frame_tone: e.target.value })}>
                    {FRAME_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <span className={labelCls}>Description (English)</span>
                  <textarea className={inputCls} rows={2} value={edit.desc_en} onChange={(e) => setEdit({ ...edit, desc_en: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <span className={labelCls}>Description (हिंदी)</span>
                  <textarea className={inputCls} rows={2} value={edit.desc_hi} onChange={(e) => setEdit({ ...edit, desc_hi: e.target.value })} />
                </div>
                <label className="flex items-center gap-2.5 text-sm text-ivory/75">
                  <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} className="h-4 w-4 accent-[#C9A24B]" />
                  Live in shop
                </label>
                <label className="flex items-center gap-2.5 text-sm text-ivory/75">
                  <input type="checkbox" checked={edit.is_featured} onChange={(e) => setEdit({ ...edit, is_featured: e.target.checked })} className="h-4 w-4 accent-[#C9A24B]" />
                  Featured on homepage
                </label>
              </div>

              {edit.id && (
                <div className="mt-6 border-t border-ivory/[0.07] pt-5">
                  <span className={labelCls}>Photos ({editImages.length})</span>
                  <div className="flex flex-wrap gap-3">
                    {editImages.map((img) => (
                      <div key={img.id} className="group relative">
                        <img src={img.url} alt="" className="h-20 w-20 rounded-lg border border-gold/20 object-cover" />
                        {img.sort === 1 && <span className="absolute left-1 top-1 rounded bg-gold px-1 py-0.5 text-[8px] font-bold uppercase text-ink">main</span>}
                        <button onClick={() => removeImage(img)} data-cursor="link"
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          ✕
                        </button>
                      </div>
                    ))}
                    <button onClick={() => fileRef.current?.click()} data-cursor="link"
                      className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gold/40 text-gold-light hover:bg-gold/5">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span className="text-[8px] font-bold uppercase tracking-[0.1em]">Add photo</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  </div>
                  <p className="mt-2 text-[10px] text-ivory/35">First photo = shop card. JPG/PNG up to 6MB.</p>
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button onClick={save} disabled={busy} data-cursor="link"
                  className="rounded-full bg-gold px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light disabled:opacity-50">
                  {busy ? "Saving…" : edit.id ? "Save changes" : "Create product"}
                </button>
                <button onClick={() => setEdit(null)} data-cursor="link"
                  className="rounded-full border border-ivory/15 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ivory/70 hover:border-gold hover:text-gold-light">
                  Close
                </button>
                {!edit.id && <span className="text-[10px] text-ivory/35">Create first — then add photos.</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
