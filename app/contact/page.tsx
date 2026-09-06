import type { Metadata } from "next";
import { SHOP } from "@/lib/site-config";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact & Visit — Quality Framing Emporium & Photo Framing Center, Raebareli",
  description:
    "Visit Quality Framing Emporium & Photo Framing Center at PNT Colony, Raebareli — near Hotel Ganesh. Open daily 10 AM–9 PM. Call or WhatsApp +91 83031 08051. Get directions and message us.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh] pb-28 pt-28 md:pt-32">
      <div aria-hidden className="absolute -top-24 right-0 h-[360px] w-[360px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[1100px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Contact · संपर्क</p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">
          Come say hello.
        </h1>
        <p className="mt-2 font-hindi text-lg text-ivory/55">आइए, मिलते हैं।</p>
        <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/60">
          Walk in any day, or reach us on WhatsApp / phone. Orders, quotes and custom frame questions all start with a
          quick message.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* info cards */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
              <h2 className="font-serif text-xl text-ivory">Visit · दुकान</h2>
              <address className="mt-3 text-sm not-italic leading-7 text-ivory/65">
                {SHOP.addressLines.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
                <span className="mt-2 block text-ivory/40">{SHOP.hours}</span>
              </address>
              <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-gold-light underline-offset-4 hover:underline">
                📍 Get directions
              </a>
            </div>

            <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
              <h2 className="font-serif text-xl text-ivory">Contact · संपर्क</h2>
              <ul className="mt-3 space-y-3 text-sm text-ivory/70">
                <li>
                  <a href={SHOP.phoneHref} className="flex items-center gap-2 hover:text-gold-light">📞 {SHOP.phoneDisplay}</a>
                </li>
                <li>
                  <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold-light">💬 WhatsApp (reply in minutes)</a>
                </li>
                <li className="flex items-center gap-2">⏰ Open daily · 10:00 AM – 9:00 PM</li>
                <li className="flex items-center gap-2">⭐ Rated {SHOP.rating} on Justdial</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-leaf/25 bg-leaf/[0.06] p-6">
              <h2 className="font-serif text-xl text-ivory">Fastest way to order</h2>
              <p className="mt-2 text-sm leading-6 text-ivory/60">
                On WhatsApp, send your photo (or just the size for glass) and we&apos;ll reply with the exact quote and a
                design preview.
              </p>
              <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-leaf px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-opacity hover:opacity-90">
                Message us now
              </a>
            </div>
          </div>

          {/* form + map */}
          <div className="space-y-5">
            <ContactForm />

            <div className="overflow-hidden rounded-2xl border border-ivory/10">
              <iframe
                title="Quality Framing Emporium, Raebareli on Google Maps"
                src="https://www.google.com/maps?q=Quality%20Glass%20Emporium%20PNT%20Colony%20Raebareli&output=embed"
                className="h-[320px] w-full grayscale contrast-125"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
