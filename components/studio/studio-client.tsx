"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";
import { formatINR } from "@/lib/format";

type Tone = "gold" | "wood" | "black";
const TONE: Record<Tone, string> = { gold: "gold-frame", wood: "wood-frame", black: "black-frame" };
const TONE_NAME: Record<Tone, { en: string; hi: string }> = {
  gold: { en: "Golden", hi: "सुनहरा" },
  wood: { en: "Wooden", hi: "लकड़ी" },
  black: { en: "Matte black", hi: "मैट काला" },
};

const SIZES = [
  { id: "a5", en: "A5 · 5×7 in", hi: "A5 · 5×7 इंच", base: 399, ratio: 5 / 7 },
  { id: "a4", en: "A4 · 8×12 in", hi: "A4 · 8×12 इंच", base: 549, ratio: 5 / 7 },
  { id: "1218", en: "12×18 in", hi: "12×18 इंच", base: 799, ratio: 2 / 3 },
  { id: "1824", en: "18×24 in", hi: "18×24 इंच", base: 1199, ratio: 3 / 4 },
];

const GLASS = [
  { id: "clear", en: "Clear glass", hi: "साफ़ काँच", delta: 0 },
  { id: "nonrefl", en: "Non-reflective glass", hi: "नॉन-रिफ्लेक्टिव काँच", delta: 250 },
];

const MATS = [
  { id: "none", en: "No mat", hi: "बिना मैट", delta: 0, color: "transparent" },
  { id: "cream", en: "Cream mat", hi: "क्रीम मैट", delta: 120, color: "#F3EDE0" },
  { id: "black", en: "Black mat", hi: "काला मैट", delta: 120, color: "#111008" },
  { id: "gold", en: "Gold mat", hi: "सुनहरा मैट", delta: 160, color: "#C9A24B" },
];

const L = {
  kicker: { en: "Custom Framing Studio", hi: "कस्टम फ़्रेमिंग स्टूडियो" },
  title: { en: "Frame your photo, live.", hi: "अपनी फोटो को फ़्रेम करें, लाइव।" },
  sub: {
    en: "Upload a photo and watch it sit inside a real frame. Pick the size, moulding, glass and mat — the price updates as you go. We hand-craft it at our Raebareli shop.",
    hi: "एक फोटो अपलोड करें और उसे असली फ़्रेम में देखें। साइज़, माउल्डिंग, काँच और मैट चुनें — दाम साथ-साथ बदलते हैं। हम इसे अपनी रायबरेली दुकान पर हाथ से बनाते हैं।",
  },
  upload: { en: "Upload your photo", hi: "अपनी फोटो अपलोड करें" },
  drop: { en: "Drag & drop, or tap to choose", hi: "खींचें और छोड़ें, या चुनने के लिए टैप करें" },
  replace: { en: "Change photo", hi: "फोटो बदलें" },
  size: { en: "Size", hi: "साइज़" },
  tone: { en: "Frame moulding", hi: "फ़्रेम माउल्डिंग" },
  glass: { en: "Glass", hi: "काँच" },
  mat: { en: "Mat / border", hi: "मैट / बॉर्डर" },
  print: { en: "Print my photo too", hi: "मेरी फोटो भी प्रिंट करें" },
  printNote: { en: "+₹99 per photo", hi: "+₹99 प्रति फ़ोटो" },
  est: { en: "Estimated price", hi: "अनुमानित दाम" },
  includes: { en: "Includes frame, glass, mat & finishing", hi: "फ़्रेम, काँच, मैट और फ़िनिशिंग शामिल" },
  note: { en: "Final price may vary a little with exact size & photo. We'll confirm on WhatsApp.", hi: "सही साइज़ और फोटो के हिसाब से अंतिम दाम थोड़ा बदल सकता है। हम WhatsApp पर पुष्टि करेंगे।" },
  whatsapp: { en: "Order this on WhatsApp", hi: "WhatsApp पर ऑर्डर करें" },
  call: { en: "Call the shop", hi: "दुकान को कॉल करें" },
  copy: { en: "Copy details", hi: "जानकारी कॉपी करें" },
  copied: { en: "Copied ✓", hi: "कॉपी हो गया ✓" },
  how: { en: "How it works", hi: "कैसे काम करता है" },
  h1: { en: "Upload", hi: "अपलोड" },
  h2: { en: "Choose", hi: "चुनें" },
  h3: { en: "We craft", hi: "हम बनाते हैं" },
  h4: { en: "Pickup / delivery", hi: "पिकअप / डिलीवरी" },
  faq: { en: "Common questions", hi: "अक्सर पूछे सवाल" },
  viewShop: { en: "Browse ready-made frames", hi: "रेडी-मेड फ़्रेम देखें" },
  empty: { en: "No photo yet — upload one to see it framed.", hi: "अभी फोटो नहीं — फ़्रेम में देखने के लिए एक अपलोड करें।" },
};

function waUrl(msg: string) {
  const u = new URL(SHOP.whatsapp);
  return `${u.origin}${u.pathname}?text=${encodeURIComponent(msg)}`;
}

export default function StudioClient() {
  const { lang } = useLanguage();
  const tx = (o: { en: string; hi: string }) => o[lang];

  const [photo, setPhoto] = useState<string>("");
  const [size, setSize] = useState(SIZES[1]);
  const [tone, setTone] = useState<Tone>("gold");
  const [glass, setGlass] = useState(GLASS[0]);
  const [mat, setMat] = useState(MATS[0]);
  const [print, setPrint] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const price = useMemo(
    () => size.base + (tone === "gold" ? 100 : tone === "wood" ? 50 : 0) + glass.delta + mat.delta + (print ? 99 : 0),
    [size, tone, glass, mat, print]
  );

  const onFile = (f?: File | null) => {
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) {
      alert("Photo looks too big — please keep it under 6 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  const details = [
    `${tx(L.size)}: ${tx(size)}`,
    `${tx(L.tone)}: ${tx(TONE_NAME[tone])}`,
    `${tx(L.glass)}: ${tx(glass)}`,
    `${tx(L.mat)}: ${tx(mat)}`,
    print ? tx(L.print) : null,
    `${tx(L.est)}: ${formatINR(price)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const msg = `Hi ${SHOP.name}! 🌟 I'd like a custom framed photo.\n\n${details}\n\nI'll share the photo here.`;

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden pb-28 pt-28 md:pt-32">
      <div aria-hidden className="absolute -top-24 right-0 h-[400px] w-[400px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
        {/* heading */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">{tx(L.kicker)}</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">{tx(L.title)}</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/60 md:text-[15px]">{tx(L.sub)}</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
          {/* ── live mockup ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="relative flex aspect-[5/6] items-center justify-center overflow-hidden rounded-2xl border border-ivory/10 bg-[radial-gradient(ellipse_at_center,rgba(255,246,218,0.05),transparent_60%)] shadow-card"
              style={{ backgroundImage: "linear-gradient(160deg,#15110a, #0c0a06)" }}
            >
              {photo ? (
                <div
                  className={`${TONE[tone]} rounded-[2px] p-[7px] shadow-frame transition-all duration-500 md:p-[10px] ${tone === "black" ? "" : ""}`}
                >
                  <div className="relative overflow-hidden border border-gold/10">
                    {mat.color !== "transparent" && (
                      <div className="absolute inset-0" style={{ background: mat.color }} />
                    )}
                    <div
                      className="relative overflow-hidden bg-ink"
                      style={{
                        aspectRatio: `${size.ratio}`,
                        margin: mat.color !== "transparent" ? "14px" : 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Your photo in a frame" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="px-6 text-center text-sm text-ivory/40">{tx(L.empty)}</p>
              )}
            </div>
            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-ivory/35">
              · {tx(L.includes)} ·
            </p>
          </div>

          {/* ── controls ── */}
          <div className="space-y-6">
            {/* upload */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gold">{tx(L.upload)}</span>
              {photo ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Uploaded photo" className="h-16 w-16 rounded-lg border border-ivory/15 object-cover" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    data-cursor="link"
                    className="rounded-full border border-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-light hover:bg-gold/10"
                  >
                    {tx(L.replace)}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
                  data-cursor="link"
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/30 bg-gold/[0.04] py-12 transition-colors hover:border-gold/60 hover:bg-gold/[0.07]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-2xl text-gold-light">+</span>
                  <span className="text-sm font-semibold text-ivory/80">{tx(L.upload)}</span>
                  <span className="text-xs text-ivory/40">{tx(L.drop)}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>

            {/* size */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gold">{tx(L.size)}</span>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s)}
                    data-cursor="link"
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      size.id === s.id ? "border-gold bg-gold text-ink" : "border-ivory/15 text-ivory/70 hover:border-gold/50"
                    }`}
                  >
                    {tx(s)} · {formatINR(s.base)}
                  </button>
                ))}
              </div>
            </div>

            {/* moulding */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gold">{tx(L.tone)}</span>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(TONE) as Tone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    data-cursor="link"
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      tone === t ? "border-gold bg-gold/[0.08] text-ivory" : "border-ivory/15 text-ivory/60 hover:border-ivory/30"
                    }`}
                  >
                    <span className={`${TONE[t]} h-5 w-7 rounded-[2px]`} />
                    {tx(TONE_NAME[t])}
                  </button>
                ))}
              </div>
            </div>

            {/* glass */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gold">{tx(L.glass)}</span>
              <div className="flex flex-wrap gap-2">
                {GLASS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGlass(g)}
                    data-cursor="link"
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      glass.id === g.id ? "border-gold bg-gold text-ink" : "border-ivory/15 text-ivory/70 hover:border-gold/50"
                    }`}
                  >
                    {tx(g)} {g.delta > 0 && `+${formatINR(g.delta)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* mat */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gold">{tx(L.mat)}</span>
              <div className="flex flex-wrap gap-2">
                {MATS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMat(m)}
                    data-cursor="link"
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      mat.id === m.id ? "border-gold bg-gold text-ink" : "border-ivory/15 text-ivory/70 hover:border-gold/50"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full border border-ivory/30" style={{ background: m.color }} />
                    {tx(m)} {m.delta > 0 && `+${formatINR(m.delta)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* print photo */}
            <button onClick={() => setPrint(!print)} data-cursor="link" className="flex items-center gap-3 text-sm text-ivory/75">
              <span className={`flex h-5 w-5 items-center justify-center rounded border ${print ? "border-gold bg-gold text-ink" : "border-ivory/30 text-transparent"}`}>✓</span>
              {tx(L.print)} <span className="text-xs text-ivory/40">{tx(L.printNote)}</span>
            </button>

            {/* price + CTA */}
            <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">{tx(L.est)}</p>
                  <p className="font-serif text-4xl text-gold-light">{formatINR(price)}</p>
                </div>
                <button onClick={copyDetails} data-cursor="link" className="rounded-full border border-ivory/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/70 hover:border-gold hover:text-gold-light">
                  {copied ? tx(L.copied) : tx(L.copy)}
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-ivory/50">{tx(L.note)}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={waUrl(msg)}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="link"
                  className="flex-1 rounded-full bg-gold px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light"
                >
                  {tx(L.whatsapp)}
                </a>
                <a
                  href={SHOP.phoneHref}
                  data-cursor="link"
                  className="rounded-full border border-ivory/20 px-6 py-4 text-center text-sm font-semibold text-ivory/80 transition-colors hover:border-gold hover:text-gold-light"
                >
                  {tx(L.call)}
                </a>
              </div>
              <Link href="/shop" data-cursor="link" className="mt-4 block text-center text-xs text-gold-light underline-offset-4 hover:underline">
                ← {tx(L.viewShop)}
              </Link>
            </div>
          </div>
        </div>

        {/* how it works */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[L.h1, L.h2, L.h3, L.h4].map((step, i) => (
            <div key={i} className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5">
              <span className="font-serif text-3xl text-gold/50">0{i + 1}</span>
              <h3 className="mt-2 font-serif text-lg text-ivory">{tx(step)}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
