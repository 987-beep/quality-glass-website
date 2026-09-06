import type { Metadata } from "next";
import Link from "next/link";
import { SHOP } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Common Questions — How to Order, Payment, Delivery | Quality Framing Emporium, Raebareli",
  description:
    "How to order a custom frame, how to pay by UPI, delivery in Raebareli, available sizes, turnaround time and bulk orders — answered by Quality Framing Emporium, PNT Colony.",
};

const FAQS = [
  { q: "How do I place an order?", a: "Pick a ready frame from the Shop, or open the Custom Framing Studio and upload your photo. Then either add to cart and check out, or tap \"Order on WhatsApp\" — we confirm the design and price, you pay by UPI, and we start crafting." },
  { q: "Can I upload my own photo?", a: "Yes. The Custom Framing Studio lets you upload a photo and preview it inside a frame with live pricing. You can also simply send the photo on WhatsApp." },
  { q: "How do I pay?", a: "We use UPI only — scan the QR at checkout, or send a payment directly to the shop's UPI ID. Upload a screenshot as proof; once we verify it, your order moves to production." },
  { q: "Do you deliver?", a: "Yes — pickup from the shop is always free, and we deliver anywhere in Raebareli city. Local delivery is free on orders above ₹500." },
  { q: "What sizes do you offer?", a: "We make any size — A5, A4, 12×18, 18×24 and every odd size in between. If you can measure it, we can frame it. Custom sizes are our daily work." },
  { q: "How long does it take?", a: "Most ready frames are done in 1–3 days. Custom frames usually take 2–5 days depending on size and moulding. You can track your order anytime on the Track page." },
  { q: "Do you do glass and mirror work?", a: "Yes — we cut glass and mirrors to size for windows, table tops, shelves and replacement framing glass. WhatsApp us the height × width and we'll quote instantly." },
  { q: "Do you handle bulk / office / school orders?", a: "Absolutely — certificates for schools, gifts for offices and frames for events. We offer special pricing for bulk. Send the quantity and we'll give you a quote." },
  { q: "Where exactly are you?", a: "Belliganj Malik Mau Road, near Hotel Ganesh, PNT Colony, Raebareli — 229 001. Open daily 10:00 AM to 9:00 PM. Get directions from the Contact page.", },
];

export default function FaqPage() {
  return (
    <main className="relative min-h-[100svh] pb-28 pt-28 md:pt-32">
      <div aria-hidden className="absolute -top-24 left-1/3 h-[340px] w-[340px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-[820px] px-5 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">FAQ · सवाल-जवाब</p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">
          Common questions.
        </h1>
        <p className="mt-2 font-hindi text-lg text-ivory/55">अक्सर पूछे जाने वाले सवाल।</p>

        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 open:border-gold/30 open:bg-gold/[0.04]">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-lg text-ivory marker:content-none">
                {f.q}
                <span className="text-gold-light transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-ivory/65">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-gold/25 bg-gold/[0.06] p-6 text-center">
          <p className="text-sm text-ivory/70">Still have a question? We reply fast on WhatsApp.</p>
          <a href={SHOP.whatsapp} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-gold px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light">
            Ask on WhatsApp
          </a>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/studio" className="text-gold-light underline-offset-4 hover:underline">Framing Studio</Link>
            <Link href="/shop" className="text-gold-light underline-offset-4 hover:underline">Shop</Link>
            <Link href="/track" className="text-gold-light underline-offset-4 hover:underline">Track an order</Link>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
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
