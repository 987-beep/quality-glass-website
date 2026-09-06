import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Wedding Album & Shadi Photo Framing in Raebareli | Quality Framing Emporium",
  description:
    "Wedding album framing and shadi photo frames in Raebareli — beautiful, hand-finished albums and collage walls. Order online or visit Quality Framing Emporium, PNT Colony. Pay by UPI.",
};

export default function WeddingAlbumPage() {
  return (
    <LocalLanding
      h1="Wedding album framing in Raebareli — your big day, kept beautiful"
      h1Sub="रायबरेली में शादी एल्बम फ़्रेमिंग — आपका ख़ास दिन, हमेशा सुंदर"
      intro={[
        "A wedding album shouldn't live in a box. At Quality Framing Emporium near Hotel Ganesh, PNT Colony, we turn your shadi album into a framed showpiece — mounted cleanly, with glass, and mouldings that match your home.",
        "Choose a single album frame, a 3-to-5 photo collage wall, or a full set for your family. Order right here on the website or send your album on WhatsApp — we'll quote, you pay by UPI, and we hand-craft it.",
      ]}
      services={[
        { title: "Single album frame", desc: "Your full wedding album framed in black, golden or wooden moulding with glass." },
        { title: "Collage wall sets", desc: "3–5 photos of the couple and family arranged in one elegant multi-window frame." },
        { title: "Canvas & photo prints", desc: "Your best wedding photos printed large on canvas or glossy paper, then framed." },
        { title: "God frame in the mandir", desc: "The shrine photo framed alongside the couple for a complete ceremony corner." },
      ]}
      priceNote="💛 Wedding albums shown live on the website with honest prices — walk-in rates, no bargaining. Pay by UPI and pick up or get it delivered in Raebareli."
      faqs={[
        { q: "How long does wedding album framing take?", a: "Usually 2–5 days, depending on the album size and moulding. Track your order anytime." },
        { q: "Can I send my album on WhatsApp?", a: "Yes — send a few photos on WhatsApp and we'll suggest the best frame and quote." },
        { q: "Do you deliver framed albums?", a: "Yes, anywhere in Raebareli city. Pickup from the shop is always free." },
      ]}
      shopCta={{ label: "Browse the shop", href: "/shop" }}
    />
  );
}
