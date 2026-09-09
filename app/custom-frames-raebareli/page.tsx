import type { Metadata } from "next";
import LocalLanding from "@/components/seo/local-landing";

export const metadata: Metadata = {
  title: "Custom Frame Shop in Raebareli | Made-to-Order Frames — Quality Glass Emporium",
  description:
    "Made-to-order custom frames in Raebareli: choose moulding, glass, mat and size for wedding photos, portraits, jerseys and art. Upload your photo online, pay by UPI, pickup or local delivery from PNT Colony, Raebareli.",
  openGraph: {
    title: "Custom Frame Shop in Raebareli | Quality Glass Emporium",
    description: "Made-to-order frames with your choice of moulding, glass and mount. Upload your photo online — we craft the rest.",
  },
};

export default function CustomFramesRaebareli() {
  return (
    <LocalLanding
      h1="Custom frames, made to order — your size, your style"
      h1Sub="आपकी पसंद का फ्रेम — साइज़, गिलास और माउंट आप चुनें"
      intro={[
        "Ready-made frames rarely fit your photo — and your memories deserve better than 'approximately right'. Here you build the frame exactly the way you want: pick the moulding that matches your home, choose clear or non-reflective glass, add a soft mat border, and tell us the size.",
        "Wedding portraits, jersey framing, certificates, posters, baby's first-year collage — if you can measure it, we can frame it. Upload the photo right here on the website, pay easily by UPI, and we hand-craft the frame at our shop on Belliganj Malik Mau Road, Raebareli.",
      ]}
      services={[
        { title: "Choose your moulding", desc: "Slim modern black, rich golden, or warm wooden finishes — every frame on the website shows its options with live prices." },
        { title: "Glass that suits the room", desc: "Clear everyday glass or non-reflective glass for bright rooms and gallery walls." },
        { title: "Mat / mount borders", desc: "A coloured inner border that makes portraits and art look instantly premium." },
        { title: "Odd sizes welcome", desc: "Panoramas, square Instagram prints, long certificates — custom cutting is our daily work." },
      ]}
      priceNote="💡 How to order fast: open any frame in the shop, upload your photo, then tap through Size → Glass → Moulding → Mat and watch the exact price update live. That is your final price — no hidden charges."
      faqs={[
        { q: "How do I order a custom frame online in Raebareli?", a: "Open the Shop page, tap a frame design, upload your photo, select size, glass, moulding and mat, then pay by UPI. We craft it and notify you the moment it is ready — track it anytime on the Track page." },
        { q: "What file should I upload for printing?", a: "A clear, full-resolution photo from your phone is usually perfect. We check every photo before printing and message you on WhatsApp if it will print blurry — we would rather ask than hand you a bad frame." },
        { q: "Can I match a frame to my existing wall frames?", a: "Yes — bring or WhatsApp us a photo of your current frames and we will match the moulding and colour as closely as possible." },
        { q: "Do you make frames for schools and offices in bulk?", a: "Absolutely — certificates, award frames and samman-patra in bulk get special shop pricing. Message us on WhatsApp with quantity and size for a same-day quote." },
      ]}
      shopCta={{ label: "Build your custom frame", href: "/shop?category=custom-framing" }}
    />
  );
}
