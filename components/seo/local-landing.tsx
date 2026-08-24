import Link from "next/link";
import { SHOP } from "@/lib/site-config";

type Faq = { q: string; a: string };

/** Shared layout for the local SEO landing pages (server-rendered). */
export default function LocalLanding({
  h1,
  h1Sub,
  intro,
  services,
  priceNote,
  faqs,
  shopCta,
}: {
  h1: string;
  h1Sub: string;
  intro: string[];
  services: { title: string; desc: string }[];
  priceNote: string;
  faqs: Faq[];
  shopCta: { label: string; href: string };
}) {
  return (
    <main className="pb-24 pt-14 md:pt-20">
      <article className="mx-auto max-w-3xl px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
          {SHOP.name} & {SHOP.unit} · Raebareli · रायबरेली
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.15] text-ivory md:text-5xl">{h1}</h1>
        <p className="mt-2 font-hindi text-lg text-ivory/55">{h1Sub}</p>

        {intro.map((p, i) => (
          <p key={i} className="mt-5 text-sm leading-7 text-ivory/70 md:text-[15px]">
            {p}
          </p>
        ))}

        {/* services */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5">
              <h2 className="font-serif text-lg text-gold-light">{s.title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-ivory/60">{s.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-xl border border-gold/25 bg-gold/[0.06] p-4 text-[13px] leading-6 text-gold-light/90">
          {priceNote}
        </p>

        {/* CTA row */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={shopCta.href}
            className="rounded-full bg-gold px-7 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light"
          >
            {shopCta.label}
          </Link>
          <a
            href={SHOP.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ivory/15 px-7 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light"
          >
            WhatsApp {SHOP.phoneDisplay}
          </a>
        </div>

        {/* FAQ */}
        <h2 className="mt-14 font-serif text-2xl text-ivory">Common questions · अक्सर पूछे सवाल</h2>
        <div className="mt-5 divide-y divide-ivory/[0.07]">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="text-sm font-semibold text-ivory/90">{f.q}</h3>
              <p className="mt-2 text-[13px] leading-6 text-ivory/60">{f.a}</p>
            </div>
          ))}
        </div>

        {/* visit */}
        <div className="mt-12 rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
          <h2 className="font-serif text-xl text-ivory">Visit the shop · दुकान पर आएँ</h2>
          <address className="mt-3 text-sm not-italic leading-7 text-ivory/65">
            {SHOP.addressLines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
            <span className="mt-1 block text-ivory/40">{SHOP.hours}</span>
          </address>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="text-gold-light underline-offset-4 hover:underline">
              📍 Get directions
            </a>
            <a href={SHOP.phoneHref} className="text-gold-light underline-offset-4 hover:underline">
              📞 Call now
            </a>
            <Link href="/track" className="text-gold-light underline-offset-4 hover:underline">
              🔍 Track an order
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-[11px] text-ivory/30">
          <Link href="/shop" className="transition-colors hover:text-gold-light">← Browse the full shop</Link>
        </p>
      </article>

      {/* FAQ structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </main>
  );
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: `${SHOP.name} & ${SHOP.unit}`,
  url: "https://quality-glass-website.vercel.app",
  telephone: "+918303108051",
  priceRange: "₹₹",
  openingHours: "Mo-Su 10:00-21:00",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Belliganj Malik Mau Road, Near Hotel Ganesh, PNT Colony",
    addressLocality: "Raebareli",
    addressRegion: "Uttar Pradesh",
    postalCode: "229001",
    addressCountry: "IN",
  },
};
