import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Anime Poster & Manga Framing in Raebareli | Quality Glass Emporium",
  description:
    "Naruto, Gojo, Luffy, Jujutsu Kaisen, Attack on Titan posters and manga frames in Raebareli — printed, framed and delivered. Quality Glass Emporium, PNT Colony. Order online, pay by UPI.",
};

export default function AnimePosterPage() {
  return (
    <LocalLanding
      h1="Anime posters & manga frames in Raebareli — bring your universe home"
      h1Sub="रायबरेली में एनिमे पोस्टर व मंगा फ़्रेम — अपना ब्रह्मांड घर लाएँ"
      intro={[
        "From Naruto's Rasengan to Gojo's Infinity Void, Luffy's crew and the Titan wall — we print anime art in vibrant colour and frame it cleanly. A3 and A2 prints, glossy or matte, with mouldings that match a wall-of-cool.",
        "This is one of the few places in Raebareli doing it properly. Pick your character from the shop, choose the size, pay by UPI, and get it delivered or pick it up.",
      ]}
      services={[
        { title: "Naruto & shonen frames", desc: "Rasengan, Team 7 and the Hidden Leaf — bold framed prints." },
        { title: "Jujutsu Kaisen & Toji", desc: "Gojo, Sukuna and the shibuya arc — poster-framed and ready." },
        { title: "One Piece, Titan & more", desc: "Straw Hat crew, Attack on Titan and the city-scapes you love." },
        { title: "Chibi sticker packs", desc: "Character sticker packs for laptops and walls — peel and stick." },
      ]}
      priceNote="⭐ Our anime shelf is a real favourite. All art framed and priced on the website — no hidden charges."
      faqs={[
        { q: "Can I get a custom character poster?", a: "Yes — send us the image and we'll print and frame it in the size you want." },
        { q: "Do you do canvas prints of anime?", a: "Yes, canvas wraps and framed art paper are both available." },
      ]}
      shopCta={{ label: "Browse anime frames", href: "/shop?category=anime-frames" }}
    />
  );
}
