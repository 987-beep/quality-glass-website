import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "God Frame & Mandir Photo Frame in Raebareli | Quality Glass Emporium",
  description:
    "God frames and mandir photo frames in Raebareli — Ganesha, Krishna, Ram, Hanuman, Islamic calligraphy and Christian art, beautifully finished. Order online or visit the shop at PNT Colony.",
};

export default function GodFramePage() {
  return (
    <LocalLanding
      h1="God frames & mandir frames in Raebareli — finished to worship with"
      h1Sub="रायबरेली में गॉड फ़्रेम व पूजा फ़्रेम — इबादत के लायक़ फ़िनिश"
      intro={[
        "A mandir photo is a daily sight. We frame deity pictures and calligraphy with rich golden mouldings and glass that keeps them clear for years — Ganesha, Krishna, Ram Darbar, Hanuman, Ayatul Kursi, Makkah and Madonna.",
        "Pick from the ready frames on the website, or bring your own photo. Buy a single god frame or a full set for the temple, and we'll hand-craft it at the shop.",
      ]}
      services={[
        { title: "Hindu god frames", desc: "Ganesha, Krishna, Ram Darbar, Hanuman and Shiv Parivar in beautiful golden finishes." },
        { title: "Islamic calligraphy frames", desc: "Ayatul Kursi, Asma ul Husna, Bismillah, Madina and Makkah — clean, reverent frames." },
        { title: "Christian art frames", desc: "Mother Mary, Jesus, the Last Supper and angels, framed respectfully." },
        { title: "Mandir & altar sets", desc: "Coordinate god frame sets for a pooja room — matched mouldings and sizes." },
      ]}
      priceNote="🙏 Honest prices shown on the website. Pay by UPI at checkout or at the counter, and pick up or get delivery in Raebareli."
      faqs={[
        { q: "Can I get my own deity photo framed?", a: "Yes — send it on WhatsApp or upload it in the studio, and we'll quote." },
        { q: "Do you make matching sets?", a: "Yes, we cut matched sizes and mouldings for a clean festival-ready set." },
      ]}
      shopCta={{ label: "Browse god frames", href: "/shop?category=hindu-gods" }}
    />
  );
}
