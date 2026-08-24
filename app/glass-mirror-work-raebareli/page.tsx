import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Glass & Mirror Work in Raebareli | Cutting, Table Tops, Sheets — Quality Glass Emporium",
  description:
    "Glass and mirror cutting in Raebareli since 2018: window glass, table-top glass, shelves, mirrors and framing glass cut to size at PNT Colony. Rated 4.9 on Justdial. Call or WhatsApp +91 83031 08051.",
  openGraph: {
    title: "Glass & Mirror Work in Raebareli | Quality Glass Emporium",
    description: "Glass cut to size — window panes, table tops, shelves and mirrors in Raebareli. Rated 4.9 on Justdial.",
  },
};

export default function GlassMirrorRaebareli() {
  return (
    <LocalLanding
      h1="Glass & mirror work in Raebareli — cut exactly to your size"
      h1Sub="रायबरेली में काँच और शीशे का काम — दुकान से ही, सही माप में"
      intro={[
        "Glass work is unforgiving — one millimetre wrong and the sheet is waste. That is why Raebareli has trusted Quality Glass Emporium for clean, accurate cutting since 2018: window panes, table tops, shelf glass, mirrors and replacement framing glass, all cut right here at the shop.",
        "Bring your measurement (or the broken piece as a sample) and most cutting is done while you wait. For framing glass and mirrors you can even check prices and order on this website before stepping out.",
      ]}
      services={[
        { title: "Glass cut to size", desc: "Window and ventilator glass, shelf glass, showcase glass — measured twice, cut once, edges finished safely." },
        { title: "Table-top & furniture glass", desc: "Protect your dining and study tables with a clean-cut top sized to the millimetre." },
        { title: "Mirrors", desc: "Bathroom, dressing and decorative mirrors cut to size, with neat edge work." },
        { title: "Framing glass replacement", desc: "Cracked glass in an old photo frame? Bring the frame — we refit fresh glass and clean the photo area." },
      ]}
      priceNote="📏 Best way to order glass: measure height × width carefully (in inches or cm, both work), then call or WhatsApp us the size — we quote immediately and tell you if your measurement needs a site visit."
      faqs={[
        { q: "Where can I get glass cut in Raebareli?", a: "Quality Glass Emporium & Photo Framing Center near Hotel Ganesh, PNT Colony (Belliganj Malik Mau Road) cuts window glass, mirror, shelf and table-top glass to size daily, 10 AM – 9 PM. WhatsApp your size to +91 83031 08051 for an instant quote." },
        { q: "Do you deliver glass in Raebareli?", a: "Small and medium sheets can be delivered within the city with careful packing. For large panes and site fitting, we guide you over WhatsApp after seeing measurements." },
        { q: "Can you replace broken glass in an old photo frame?", a: "Yes — bring the frame to the shop and we cut a fresh piece to fit, clean the inside, and refit it neatly. It makes old framed photos look new again." },
        { q: "How is glass priced?", a: "By type, thickness and square area — tell us the size and use on WhatsApp and we will tell you the exact price before you travel to the shop." },
      ]}
      shopCta={{ label: "See glass & mirror options", href: "/shop?category=glass-mirror" }}
    />
  );
}
