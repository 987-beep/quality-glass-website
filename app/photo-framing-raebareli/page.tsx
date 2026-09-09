import type { Metadata } from "next";
import LocalLanding, { LOCAL_BUSINESS_JSONLD } from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Photo Framing in Raebareli | Quality Glass Emporium & Photo Framing Center",
  description:
    "Premium photo framing in Raebareli near Hotel Ganesh, PNT Colony. Custom frames, god frames, photo printing & framing with glass, mounts and home delivery in Raebareli. Order online or visit the shop — open daily 10 AM–9 PM.",
  openGraph: {
    title: "Photo Framing in Raebareli | Quality Glass Emporium",
    description: "Custom photo frames, god frames and photo printing in Raebareli. Order online, pay by UPI, pickup or local delivery.",
  },
};

export default function PhotoFramingRaebareli() {
  return (
    <>
      <LocalLanding
        h1="Photo Framing in Raebareli — crafted to last a lifetime"
        h1Sub="रायबरेली में फोटो फ्रेमिंग — आपकी यादें, हमारा हुनर"
        intro={[
          "A photograph fades, but a well-framed memory stays fresh for decades. At Quality Glass Emporium & Photo Framing Center near Hotel Ganesh, PNT Colony, we frame wedding photos, children's portraits, certificates, deity pictures and art prints for families across Raebareli — with the same care we put into our own.",
          "You can walk into the shop and choose mouldings by hand, or order right here online: pick a design, choose your size, glass and mount, pay by UPI, and collect your frame from the counter or get it delivered anywhere in Raebareli city.",
        ]}
        services={[
          { title: "Custom photo frames", desc: "Any size, any photo. Choose black, golden or wooden mouldings with clear or non-reflective glass and elegant mat borders." },
          { title: "God & temple frames", desc: "Beautifully finished frames for mandirs — Hindu deities, Islamic calligraphy and Christian art, ready to hang." },
          { title: "Print + frame together", desc: "Send us your photo on WhatsApp or upload it here — we print it in rich colour and frame it in one order." },
          { title: "Certificates & documents", desc: "Degrees, awards and samman-patra framed smartly for offices, schools and homes across the city." },
        ]}
        priceNote="💛 Honest shop prices, shown live on the website — no bargaining needed. Pay by UPI at order time or at the counter. Track your frame's progress anytime on the Track page."
        faqs={[
          { q: "What is the price of photo framing in Raebareli?", a: "Framing cost depends on size, moulding, glass and mount. Small table frames start in the low hundreds of rupees and large premium frames go higher — every frame on our website shows its exact price with all options before you order, so there are no surprises." },
          { q: "Can I get my own photo framed without visiting the shop?", a: "Yes! Order on this website or send your photo on WhatsApp (+91 83031 08051). We print and frame it, and you can collect from the shop near Hotel Ganesh, PNT Colony, or take local delivery anywhere in Raebareli." },
          { q: "How long does a custom frame take?", a: "Most custom frames are ready in 2–4 working days. Urgent wedding or gift orders are often faster — message us on WhatsApp and we will tell you honestly what is possible." },
          { q: "Do you deliver outside Raebareli?", a: "Currently we hand-deliver within Raebareli city so your glass frames arrive safe. For nearby towns, talk to us on WhatsApp and we will find a way." },
        ]}
        shopCta={{ label: "Browse frames & prices", href: "/shop" }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }}
      />
    </>
  );
}
