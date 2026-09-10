"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";
import RevealText from "@/components/fx/reveal-text";

const milestones = [
  { year: "2018", title: { en: "Started the Shop", hi: "दुकान शुरू" }, desc: { en: "Quality Glass Emporium opened at PNT Colony, Raebareli with a vision to bring premium framing to the city.", hi: "क्वालिटी ग्लास एम्पोरियम ने पीएनटी कॉलोनी, रायबरेली में शुरू किया।" } },
  { year: "2019", title: { en: "1000+ Frames", hi: "1000+ फ़्रेम" }, desc: { en: "Crossed our first 1000 frames milestone — wedding albums, certificates, and family portraits.", hi: "पहले 1000 फ़्रेम का लक्ष्य पार — शादी एल्बम, सर्टिफिकेट और फैमिली पोर्ट्रेट।" } },
  { year: "2021", title: { en: "Glass & Mirror Work", hi: "काँच व शीशा काम" }, desc: { en: "Expanded into custom glass cutting, mirror work, and LED mirror installations.", hi: "कस्टम काँच कटिंग, शीशा काम और LED मिरर इंस्टॉलेशन में विस्तार।" } },
  { year: "2023", title: { en: "4.9★ on Justdial", hi: "Justdial पर 4.9★" }, desc: { en: "Achieved 4.9 star rating on Justdial with 48+ verified reviews from happy customers.", hi: "Justdial पर 48+ वेरिफाइड रिव्यू के साथ 4.9 स्टार रेटिंग हासिल।" } },
  { year: "2024", title: { en: "Online Store Launch", hi: "ऑनलाइन स्टोर लॉन्च" }, desc: { en: "Launched our e-commerce website — browse, order, and pay from home.", hi: "ई-कॉमर्स वेबसाइट लॉन्च — घर बैठे ब्राउज़, ऑर्डर और पेमेंट।" } },
];

const values = [
  { icon: "🎨", title: { en: "Handcrafted Quality", hi: "हाथ से बनी गुणवत्ता" }, desc: { en: "Every frame is cut, assembled, and finished by hand — no shortcuts.", hi: "हर फ़्रेम हाथ से कटा, जोड़ा और फिनिश किया जाता है।" } },
  { icon: "💰", title: { en: "Fair Pricing", hi: "सही दाम" }, desc: { en: "Premium quality at honest prices — no hidden charges, GST included.", hi: "ईमानदार दामों पर प्रीमियम क्वालिटी — कोई छुपा चार्ज नहीं।" } },
  { icon: "🚚", title: { en: "On-Time Delivery", hi: "समय पर डिलीवरी" }, desc: { en: "We respect your deadlines — wedding dates, events, gifts.", hi: "हम आपकी डेडलाइन का सम्मान करते हैं — शादी, इवेंट, गिफ्ट।" } },
  { icon: "🤝", title: { en: "Personal Service", hi: "व्यक्तिगत सेवा" }, desc: { en: "We help you pick the perfect frame, mat, and glass for your photo.", hi: "हम आपकी फोटो के लिए सही फ़्रेम, मैट और काँच चुनने में मदद करते हैं।" } },
];

function CountUp({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{value.toLocaleString("en-IN")}{suffix}</span>;
}

export default function AboutPage() {
  const { lang } = useLanguage();

  return (
    <main className="relative min-h-[100svh] pb-24 pt-28 md:pt-36">
      <div aria-hidden className="absolute -top-32 right-0 h-[400px] w-[400px] rounded-full bg-gold/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
        {/* Header */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold md:text-[11px]">
          {lang === "hi" ? "हमारे बारे में" : "About Us"}
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ivory md:text-7xl">
          <RevealText text={lang === "hi" ? "फ़्रेमिंग का" : "Crafting frames"} className="block" />
          <em className="italic text-gold-light">
            <RevealText text={lang === "hi" ? "8+ साल का तजुर्बा" : "since 2018."} className="block" delay={0.15} />
          </em>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-ivory/65 md:text-base md:leading-8">
          {lang === "hi"
            ? "क्वालिटी ग्लास एम्पोरियम रायबरेली में प्रीमियम फोटो फ़्रेमिंग, काँच का काम और कस्टम गिफ़्टिंग का भरोसेमंद नाम है। 2018 से, हम हर याद को खूबसूरत फ़्रेम में सजा रहे हैं।"
            : "Quality Glass Emporium is Raebareli's trusted name for premium photo framing, glass work, and custom gifting. Since 2018, we've been turning memories into beautiful frames."}
        </p>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: 8, suffix: "+", label: { en: "Years of craft", hi: "साल का तजुर्बा" } },
            { value: 5000, suffix: "+", label: { en: "Frames delivered", hi: "फ़्रेम डिलीवर" } },
            { value: 4.9, suffix: "", label: { en: "Justdial rating", hi: "Justdial रेटिंग" }, decimals: 1 },
            { value: 100, suffix: "%", label: { en: "Hand-crafted", hi: "हाथ से निर्मित" } },
          ].map((s) => (
            <div key={s.label.en} className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 text-center md:p-6">
              <p className="font-serif text-4xl text-gold md:text-5xl">
                <CountUp target={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory/45">
                {s.label[lang] || s.label.en}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <section className="mt-20">
          <h2 className="font-serif text-3xl text-ivory md:text-4xl">
            {lang === "hi" ? "हमारी यात्रा" : "Our Journey"}
          </h2>
          <div className="mt-10 space-y-0">
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex gap-6 ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
                <div className="hidden w-1/2 md:block" />
                <div className="relative flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full border-2 border-gold bg-ink" />
                  {i < milestones.length - 1 && <div className="w-px flex-1 bg-gold/20" />}
                </div>
                <div className={`flex-1 pb-10 ${i % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                  <span className="font-serif text-2xl text-gold">{m.year}</span>
                  <h3 className="mt-1 font-serif text-lg text-ivory">{m.title[lang] || m.title.en}</h3>
                  <p className="mt-1 text-sm text-ivory/55">{m.desc[lang] || m.desc.en}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mt-20">
          <h2 className="font-serif text-3xl text-ivory md:text-4xl">
            {lang === "hi" ? "हमारे मूल्य" : "Why Choose Us"}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title.en} className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-3 font-serif text-lg text-ivory">{v.title[lang] || v.title.en}</h3>
                <p className="mt-2 text-sm text-ivory/55">{v.desc[lang] || v.desc.en}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="mt-20 rounded-2xl border border-ivory/10 bg-white/[0.02] p-6 md:p-10">
          <h2 className="font-serif text-3xl text-ivory md:text-4xl">
            {lang === "hi" ? "हमारी दुकान" : "Visit Our Shop"}
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <address className="not-italic text-sm leading-7 text-ivory/65">
                {SHOP.addressLines.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
              </address>
              <p className="mt-3 text-sm text-ivory/40">{SHOP.hours}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light">
                  {lang === "hi" ? "रास्ता देखें" : "Get Directions"}
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
                </a>
                <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:text-gold-light">
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-ivory/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.1!2d81.2!3d26.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDEyJzAwLjAiTiA4McKwMTInMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                title="Shop location"
                className="grayscale invert-[90%] contrast-[1.2]"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/shop" className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light">
            {lang === "hi" ? "शॉप देखें" : "Browse the Shop"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8" /></svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
