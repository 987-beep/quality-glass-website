"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";
import RevealText from "@/components/fx/reveal-text";
import { showToast } from "@/components/toast";

export default function ContactPage() {
  const { lang } = useLanguage();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = lang === "hi" ? "नाम ज़रूरी है" : "Name is required";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = lang === "hi" ? "सही 10 अंकों का नंबर लिखें" : "Enter a valid 10-digit number";
    if (!form.message.trim()) e.message = lang === "hi" ? "संदेश ज़रूरी है" : "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    const text = `Hi! I'm ${form.name}.\nPhone: ${form.phone}\nMessage: ${form.message}`;
    const url = `https://wa.me/918303108051?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", phone: "", message: "" });
      showToast(lang === "hi" ? "WhatsApp पर भेजा गया!" : "Sent via WhatsApp!", "success");
    }, 1000);
  };

  const inputBase = "w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-sm text-ivory placeholder-ivory/30 outline-none transition-all duration-300 focus:border-gold focus:ring-2 focus:ring-gold/20";

  return (
    <main className="relative min-h-[100svh] pb-24 pt-28 md:pt-36">
      <div aria-hidden className="absolute -top-32 left-0 h-[400px] w-[400px] rounded-full bg-gold/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
          {lang === "hi" ? "संपर्क करें" : "Get in Touch"}
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ivory md:text-7xl">
          <RevealText text={lang === "hi" ? "हमसे बात" : "Let's talk"} className="block" />
          <em className="italic text-gold-light">
            <RevealText text={lang === "hi" ? "करें।" : "about your frame."} className="block" delay={0.15} />
          </em>
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Phone */}
            <a href={SHOP.phoneHref} className="group flex items-start gap-4 rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-xl">📞</span>
              <div>
                <p className="text-sm font-semibold text-ivory">{lang === "hi" ? "फ़ोन करें" : "Call Us"}</p>
                <p className="mt-1 text-sm text-ivory/55">{SHOP.phoneDisplay}</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="group flex items-start gap-4 rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-ivory">WhatsApp</p>
                <p className="mt-1 text-sm text-ivory/55">{lang === "hi" ? "आमतौर पर मिनटों में जवाब" : "Usually replies in minutes"}</p>
              </div>
            </a>

            {/* Address */}
            <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="group flex items-start gap-4 rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-xl">📍</span>
              <div>
                <p className="text-sm font-semibold text-ivory">{lang === "hi" ? "दुकान का पता" : "Visit Us"}</p>
                <address className="mt-1 not-italic text-sm leading-6 text-ivory/55">
                  {SHOP.addressLines.map((l) => (
                    <span key={l} className="block">{l}</span>
                  ))}
                </address>
              </div>
            </a>

            {/* Hours */}
            <div className="flex items-start gap-4 rounded-2xl border border-ivory/10 bg-white/[0.02] p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-xl">🕐</span>
              <div>
                <p className="text-sm font-semibold text-ivory">{lang === "hi" ? "समय" : "Business Hours"}</p>
                <p className="mt-1 text-sm text-ivory/55">{SHOP.hours}</p>
                <p className="mt-1 text-xs text-green-400">{lang === "hi" ? "अभी खुला" : "Open now"}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6 md:p-8">
            <h2 className="font-serif text-2xl text-ivory">
              {lang === "hi" ? "संदेश भेजें" : "Send a Message"}
            </h2>
            <p className="mt-2 text-sm text-ivory/45">
              {lang === "hi" ? "हम WhatsApp पर जवाब देंगे" : "We'll reply on WhatsApp"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={lang === "hi" ? "आपका नाम" : "Your name"}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`${inputBase} ${errors.name ? "border-red-500 shake" : "border-ivory/15"}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder={lang === "hi" ? "फ़ोन नंबर" : "Phone number"}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`${inputBase} ${errors.phone ? "border-red-500 shake" : "border-ivory/15"}`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <textarea
                  placeholder={lang === "hi" ? "आपका संदेश" : "Your message"}
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputBase} resize-none ${errors.message ? "border-red-500 shake" : "border-ivory/15"}`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-gold px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light disabled:opacity-50"
              >
                {sending
                  ? lang === "hi" ? "भेजा जा रहा है..." : "Sending..."
                  : lang === "hi" ? "WhatsApp पर भेजें" : "Send on WhatsApp"}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-ivory/10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.1!2d81.2!3d26.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDEyJzAwLjAiTiA4McKwMTInMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
            width="100%"
            height="350"
            style={{ border: 0 }}
            loading="lazy"
            title="Shop location"
            className="grayscale invert-[90%] contrast-[1.2]"
          />
        </div>
      </div>
    </main>
  );
}
