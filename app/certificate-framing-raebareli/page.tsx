import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Certificate & Document Framing in Raebareli | Quality Glass Emporium",
  description:
    "Certificate framing, degree framing, samman-patra and award frames in Raebareli — uniform, professional and ready in days. Quality Glass Emporium, PNT Colony. Order online.",
};

export default function CertificateFramingPage() {
  return (
    <LocalLanding
      h1="Certificate & document framing in Raebareli — neat, uniform, professional"
      h1Sub="रायबरेली में सर्टिफ़िकेट व दस्तावेज़ फ़्रेमिंग — साफ़, बराबर, प्रोफ़ेशनल"
      intro={[
        "Degrees, awards, samman-patra and license certificates deserve better than a tack on the wall. We frame them cleanly and uniformly — perfect for offices, schools, courts and homes across Raebareli.",
        "Bring one certificate or a hundred; we'll cut identical sizes, match the frame and glass, and hand them back ready to hang. For large batches we offer special pricing.",
      ]}
      services={[
        { title: "Degree & certificate framing", desc: "A4/A3 and any odd size, framed with clear or non-reflective glass and elegant mats." },
        { title: "Samman-patra & awards", desc: "Shield and award certificates framed to look ceremonial — great for functions." },
        { title: "Office batch framing", desc: "Uniform frames for a whole office wall, cut and finished consistently." },
        { title: "Documents & licenses", desc: "Trade licenses, property papers, curriculum vitae and more — clean glass, safe edges." },
      ]}
      priceNote="📄 Batch discount available. WhatsApp us the quantity and size for an instant quote — we reply in minutes."
      faqs={[
        { q: "Can you do a large batch for an office or school?", a: "Yes — uniform sizes and frames, special bulk pricing, and quick turnaround." },
        { q: "Do you frame odd-sized certificates?", a: "Yes, any size. Measure first and share the dimensions." },
      ]}
      shopCta={{ label: "Order a certificate frame", href: "/shop" }}
    />
  );
}
