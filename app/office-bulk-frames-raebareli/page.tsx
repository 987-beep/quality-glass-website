import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Office & Bulk Framing in Raebareli | Corporate Gifts, Certificates — Quality Glass Emporium",
  description:
    "Bulk framing for offices, schools and events in Raebareli — uniform certificates, wall décor, corporate gifts and event frames. Special pricing. Quality Glass Emporium, PNT Colony. Get a quote today.",
};

export default function OfficeBulkPage() {
  return (
    <LocalLanding
      h1="Office & bulk framing in Raebareli — uniform, on time, on budget"
      h1Sub="रायबरेली में ऑफिस व बल्क फ़्रेमिंग — एक जैसा, समय पर, बजट में"
      intro={[
        "From a school's 200 certificates to a corporate thank-you wall, bulk framing needs consistency — same sizes, same frames, same finish. That's our daily work at Quality Glass Emporium, PNT Colony.",
        "Tell us the quantity and the occasion, and we'll quote a special bulk price, coordinate the design, and deliver the batch ready to hang. Event orders can be scheduled with a single ₹200 slot-booking advance.",
      ]}
      services={[
        { title: "Certificate batches", desc: "Degrees, awards and samman-patra framed uniformly for schools, colleges and offices." },
        { title: "Office & gallery walls", desc: "A branded wall of photos, awards and milestones, matched and hung to spec." },
        { title: "Corporate gifts", desc: "Framed keepsakes and name frames for clients, teams and farewells." },
        { title: "Event & function frames", desc: "Frames for award ceremonies, weddings, and religious events — scheduled to your date." },
      ]}
      priceNote="📦 Bulk gets special pricing. Share the quantity and size, and we'll reply with a quote within minutes."
      faqs={[
        { q: "Is there a minimum order for bulk?", a: "No hard minimum — bulk pricing kicks in with quantity. Tell us what you need." },
        { q: "Can you meet a tight deadline?", a: "For most batches, yes. Share your date and we'll confirm turnaround." },
      ]}
      shopCta={{ label: "Enquire for bulk", href: "/bulk" }}
    />
  );
}
