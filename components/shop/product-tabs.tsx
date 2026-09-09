"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { SHOP } from "@/lib/site-config";

type Review = { author: string; area?: string | null; rating: number; text: string };

const COPY = {
  en: {
    description: "Description",
    specs: "Specifications",
    reviews: "Reviews",
    shipping: "Shipping",
    noReviews: "No reviews for this piece yet. Be the first — send us a photo on WhatsApp after delivery.",
    specRows: [
      ["Material", "Seasoned wood / synthetic moulding"],
      ["Glass", "2mm clear float glass (acrylic option available)"],
      ["Backing", "MDF board with sealed dust cover"],
      ["Hanging", "Sawtooth hook + wall nails included"],
      ["Finish", "Hand-polished, lacquer sealed"],
      ["Size", "Chosen at order time — tell us your size on WhatsApp"],
      ["Made in", "Raebareli, Uttar Pradesh"],
      ["Warranty", "6 months against manufacturing defects"],
    ],
    shipBody: [
      { t: "Local delivery (Raebareli)", d: "Free above ₹999. Same-day or next-day delivery within city limits." },
      { t: "Across Uttar Pradesh", d: "3–5 working days. Charges calculated at checkout by weight and distance." },
      { t: "Rest of India", d: "5–8 working days via insured courier. Every frame is corner-guarded and double-boxed." },
      { t: "Store pickup", d: `Ready in 24 hours at ${SHOP.addressLines?.[0] ?? "our shop"}. No delivery charge.` },
      { t: "Damage policy", d: "Photograph the parcel before opening. Any transit damage is replaced free within 48 hours of delivery." },
    ],
  },
  hi: {
    description: "विवरण",
    specs: "विशेषताएँ",
    reviews: "समीक्षाएँ",
    shipping: "शिपिंग",
    noReviews: "इस फ्रेम की अभी कोई समीक्षा नहीं है। डिलीवरी के बाद हमें WhatsApp पर फोटो भेजें।",
    specRows: [
      ["सामग्री", "सीज़न की हुई लकड़ी / सिंथेटिक मोल्डिंग"],
      ["काँच", "2mm साफ़ फ्लोट ग्लास (एक्रेलिक विकल्प उपलब्ध)"],
      ["बैकिंग", "MDF बोर्ड, धूल-रोधी सील के साथ"],
      ["टाँगने हेतु", "हुक + कील साथ में"],
      ["फिनिश", "हाथ से पॉलिश, लैकर सील"],
      ["साइज़", "ऑर्डर के समय चुनें — WhatsApp पर बताएँ"],
      ["निर्माण", "रायबरेली, उत्तर प्रदेश"],
      ["वारंटी", "निर्माण दोष पर 6 महीने"],
    ],
    shipBody: [
      { t: "लोकल डिलीवरी (रायबरेली)", d: "₹999 से ऊपर मुफ़्त। शहर में उसी दिन या अगले दिन।" },
      { t: "पूरे उत्तर प्रदेश", d: "3–5 कार्यदिवस। शुल्क चेकआउट पर।" },
      { t: "पूरे भारत", d: "5–8 कार्यदिवस, बीमित कूरियर से। हर फ्रेम डबल-बॉक्स में।" },
      { t: "दुकान से पिकअप", d: "24 घंटे में तैयार। कोई डिलीवरी शुल्क नहीं।" },
      { t: "क्षति नीति", d: "खोलने से पहले पार्सल की फोटो लें। ट्रांज़िट क्षति 48 घंटे में मुफ़्त बदली।" },
    ],
  },
};

export default function ProductTabs({
  description,
  reviews = [],
  avgRating,
  reviewCount = 0,
}: {
  description: string;
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const [tab, setTab] = useState(0);

  const tabs = [c.description, c.specs, `${c.reviews}${reviewCount ? ` (${reviewCount})` : ""}`, c.shipping];

  return (
    <section className="mt-20 md:mt-28">
      {/* tab bar */}
      <div className="relative flex gap-1 overflow-x-auto border-b border-ivory/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`relative shrink-0 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 md:text-xs ${
              tab === i ? "text-gold" : "text-ivory/45 hover:text-ivory/80"
            }`}
          >
            {label}
            <span
              className={`absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-gold transition-all duration-300 ${
                tab === i ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
            />
          </button>
        ))}
      </div>

      {/* panels */}
      <div key={tab} className="pt-8" style={{ animation: "tabFade 400ms ease-out" }}>
        {tab === 0 && (
          <div className="max-w-3xl space-y-4 text-sm leading-7 text-ivory/60 md:text-base md:leading-8">
            <p>{description}</p>
            <p>
              {lang === "hi"
                ? "हर फ्रेम रायबरेली की हमारी वर्कशॉप में हाथ से बनाया जाता है। लकड़ी काटने से लेकर अंतिम पॉलिश तक — कोई मशीन असेंबली नहीं, कोई शॉर्टकट नहीं।"
                : "Every frame is cut, joined, and finished by hand in our Raebareli workshop — from mitre cut to final polish. No machine assembly, no shortcuts."}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {(lang === "hi"
                ? ["हाथ से बनी मिटर जॉइनरी", "धूल-रोधी सीलबंद बैकिंग", "टाँगने का सामान शामिल", "8+ वर्षों का अनुभव"]
                : ["Hand-cut mitre joinery", "Dust-sealed backing board", "Hanging kit included", "Backed by 8+ years of craft"]
              ).map((f) => (
                <li key={f} className="flex items-start gap-3 rounded-xl border border-ivory/8 bg-white/[0.02] px-4 py-3">
                  <span className="mt-0.5 text-gold">✦</span>
                  <span className="text-sm text-ivory/65">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 1 && (
          <div className="max-w-3xl overflow-hidden rounded-xl border border-ivory/10">
            {c.specRows.map(([k, v], i) => (
              <div
                key={k}
                className={`grid grid-cols-[130px_1fr] gap-4 px-5 py-4 text-sm md:grid-cols-[200px_1fr] ${
                  i % 2 ? "bg-white/[0.02]" : ""
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold/80">{k}</span>
                <span className="text-ivory/60">{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div className="max-w-3xl">
            {avgRating && reviewCount > 0 ? (
              <div className="mb-8 flex items-center gap-5 rounded-2xl border border-gold/20 bg-gold/[0.04] p-6">
                <div className="text-center">
                  <p className="font-serif text-5xl text-gold-light">{avgRating.toFixed(1)}</p>
                  <p className="mt-1 text-sm tracking-[0.14em] text-gold">
                    {"★".repeat(Math.round(avgRating))}
                    <span className="text-ivory/20">{"★".repeat(5 - Math.round(avgRating))}</span>
                  </p>
                </div>
                <div className="h-14 w-px bg-gold/20" />
                <div>
                  <p className="text-sm text-ivory/70">{reviewCount} verified customer reviews</p>
                  <p className="mt-1 text-xs text-ivory/40">Collected from WhatsApp & Justdial</p>
                </div>
              </div>
            ) : null}

            {reviews.length ? (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="rounded-xl border border-ivory/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-serif text-lg text-ivory">{r.author}</p>
                      <span className="text-xs tracking-[0.12em] text-gold">
                        {"★".repeat(r.rating)}
                        <span className="text-ivory/15">{"★".repeat(5 - r.rating)}</span>
                      </span>
                    </div>
                    {r.area && <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-ivory/30">{r.area}</p>}
                    <p className="mt-3 text-sm leading-6 text-ivory/55">{r.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gold/25 bg-gold/[0.03] p-8 text-center text-sm leading-6 text-ivory/50">
                {c.noReviews}
              </p>
            )}
          </div>
        )}

        {tab === 3 && (
          <div className="max-w-3xl space-y-3">
            {c.shipBody.map((s) => (
              <div key={s.t} className="flex gap-4 rounded-xl border border-ivory/10 bg-white/[0.02] p-5">
                <span className="mt-0.5 text-gold">◆</span>
                <div>
                  <p className="text-sm font-semibold text-ivory/85">{s.t}</p>
                  <p className="mt-1.5 text-sm leading-6 text-ivory/50">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
