import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SHOP } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us — Quality Framing Emporium & Photo Framing Center, Raebareli",
  description:
    "Quality Framing Emporium & Photo Framing Center in PNT Colony, Raebareli — crafting beautiful photo frames, custom frames and glass work since 2018. Rated 4.9 on Justdial.",
};

const TIMELINE = [
  { y: "2018", en: "The shop opens", hi: "दुकान की शुरुआत", descEn: "Quality Framing Emporium starts at PNT Colony, Raebareli with a cutting machine and a promise: measure twice, cut once.", descHi: "रायबरेली की पीएनटी कॉलोनी में क्वालिटी फ़्रेमिंग एम्पोरियम शुरू — एक कटिंग मशीन और एक वादा: दो बार मापो, एक बार काटो।" },
  { y: "2020", en: "Photo framing, mastered", hi: "फोटो फ़्रेमिंग में महारत", descEn: "Expanded into premium photo framing and custom mouldings — everyday photos started leaving in gallery frames.", descHi: "प्रीमियम फोटो फ़्रेमिंग और कस्टम माउल्डिंग में विस्तार — रोज़मर्रा की तस्वीरें गैलरी फ़्रेम में जाने लगीं।" },
  { y: "2023", en: "5,000 frames", hi: "5,000 फ़्रेम", descEn: "Crossed five thousand frames crafted — and a 4.9★ rating on Justdial that we work every day to keep.", descHi: "पाँच हज़ार फ़्रेम का आँकड़ा पार — और Justdial पर 4.9★ रेटिंग, जिसे हम रोज़ बरक़रार रखते हैं।" },
  { y: "2026", en: "The shop goes online", hi: "दुकान ऑनलाइन", descEn: "Now you can frame your photo from home — upload, choose, pay by UPI, and pick up or get it delivered.", descHi: "अब घर बैठे फ़्रेम कराएँ — अपलोड, चुनें, UPI से भुगतान, और पिकअप या डिलीवरी।" },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-[100svh] pb-28 pt-28 md:pt-32">
      <div aria-hidden className="absolute -top-24 left-1/3 h-[360px] w-[360px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1000px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Our story · हमारी कहानी</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">
          A memory deserves a frame.
        </h1>
        <p className="mt-2 font-hindi text-lg text-ivory/55">एक याद फ़्रेम की हक़दार है।</p>

        <div className="mt-8 grid items-start gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4 text-[15px] leading-7 text-ivory/70">
            <p>
              Quality Framing Emporium &amp; Photo Framing Center started in 2018 near Hotel Ganesh, PNT Colony, Raebareli
              — a small workshop with a glass cutter and an unusual belief: that the frames we make should be worth
              hanging for a lifetime, not just until the next festival.
            </p>
            <p>
              Since then we&apos;ve framed wedding albums, god frames, certificates, anime art and grandmother&apos;s
              faded portraits. We cut glass to the millimetre, pick mouldings that match your wall, and finish every
              frame by hand. It&apos;s honest work, priced out front.
            </p>
            <p>
              In 2026 we brought the shop to your pocket: order online, pay by UPI, track your frame — and still get
              that same hand-made finish.
            </p>
          </div>
          <div className="gold-frame rounded-[2px] p-[9px] shadow-frame">
            <div className="relative aspect-[4/5] overflow-hidden border border-gold/10 bg-mat">
              <div className="absolute inset-[9px] overflow-hidden bg-ink">
                <Image src="/images/hero-family.jpg" alt="Quality Framing Emporium, Raebareli" fill sizes="(max-width:768px) 90vw, 420px" className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { v: "2018", l: "Since · से", e: "Established" },
            { v: "5000+", l: "फ़्रेम", e: "Frames crafted" },
            { v: "4.9★", l: "Justdial", e: "Rated" },
            { v: "100%", l: "हाथ से", e: "Hand-crafted" },
          ].map((s) => (
            <div key={s.e} className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6 text-center">
              <p className="font-serif text-3xl text-gold-light">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ivory/45">{s.l}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ivory/30">{s.e}</p>
            </div>
          ))}
        </div>

        {/* timeline */}
        <h2 className="mt-16 font-serif text-3xl text-ivory">The journey · सफ़र</h2>
        <div className="mt-6 space-y-0 border-l border-gold/20 pl-6">
          {TIMELINE.map((t) => (
            <div key={t.y} className="relative pb-8">
              <span className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-gold shadow-glowgold" />
              <p className="font-serif text-lg text-gold-light">{t.y}</p>
              <h3 className="mt-1 font-serif text-xl text-ivory">{t.en}</h3>
              <p className="font-hindi text-sm text-ivory/50">{t.hi}</p>
              <p className="mt-2 text-sm leading-6 text-ivory/60">{t.descEn}</p>
              <p className="mt-1 font-hindi text-[13px] leading-6 text-ivory/45">{t.descHi}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row">
          <Link href="/studio" className="rounded-full bg-gold px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-ink shadow-glowgold transition-colors hover:bg-gold-light">
            Frame your photo today
          </Link>
          <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-ivory/20 px-8 py-4 text-center text-sm font-semibold text-ivory/80 transition-colors hover:border-gold hover:text-gold-light">
            Visit the shop · दुकान पर आएँ
          </a>
        </div>
      </div>
    </main>
  );
}
