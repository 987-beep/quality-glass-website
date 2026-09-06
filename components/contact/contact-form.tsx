"use client";

import { useState } from "react";
import { SHOP } from "@/lib/site-config";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const openWhatsApp = () => {
    const text = `Hi ${SHOP.name}! I'm ${name || "a customer"}.\n${msg}`.trim();
    const u = new URL(SHOP.whatsapp);
    window.open(`${u.origin}${u.pathname}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
      <h2 className="font-serif text-xl text-ivory">Send a message · संदेश भेजें</h2>
      <p className="mt-1 text-xs leading-5 text-ivory/45">We reply on WhatsApp — type below and we&apos;ll open it for you.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Amit Verma"
            className="w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Message</label>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="I'd like a frame for a 12×18 photo…"
            className="w-full rounded-lg border border-ivory/15 bg-ink px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none" />
        </div>
        <button onClick={openWhatsApp} data-cursor="link"
          className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light">
          Send on WhatsApp
        </button>
      </div>
    </div>
  );
}
