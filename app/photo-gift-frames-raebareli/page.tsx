import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Photo Gift Frames & Custom Name Frames in Raebareli | Quality Glass Emporium",
  description:
    "Birthday, anniversary and custom name photo gift frames in Raebareli — a framed memory makes the best gift. Order online, pay by UPI, pickup or local delivery. Quality Glass Emporium, PNT Colony.",
};

export default function PhotoGiftPage() {
  return (
    <LocalLanding
      h1="Photo gift frames in Raebareli — give a framed memory"
      h1Sub="रायबरेली में फोटो गिफ़्ट फ़्रेम — फ़्रेम की हुई याद का तोहफ़ा"
      intro={[
        "The best gifts are personal. A childhood photo in a round frame, a couple's collage for an anniversary, a name-letter frame for a new home or a baby's first-year montage — each one hand-crafted by us and ready to gift-wrap.",
        "Upload the photo in our studio, or send it on WhatsApp, and we'll suggest a design that fits the occasion and your budget. Most gift frames are ready in 2–3 days.",
      ]}
      services={[
        { title: "Birthday photo frames", desc: "A framed baby photo, first-birthday shoot or a collage of milestones." },
        { title: "Anniversary collage", desc: "A journey into one frame — a timeline of photos from dating to today." },
        { title: "Custom name frames", desc: "Name-letter wall frames and personalised décor for a new home or shop." },
        { title: "Passport-size & keepsakes", desc: "Tiny framed keepsakes and passport-size photos for family and friends." },
      ]}
      priceNote="🎁 A framed memory beats a chocolate — and it's priced honestly on the site. Pay by UPI and pick up or get it delivered in Raebareli."
      faqs={[
        { q: "Can you wrap it as a gift?", a: "Yes — we can present it framed and ready to gift." },
        { q: "How fast can I get a gift frame?", a: "Most gift frames are ready in 2–3 days." },
      ]}
      shopCta={{ label: "Start a gift frame", href: "/studio" }}
    />
  );
}
