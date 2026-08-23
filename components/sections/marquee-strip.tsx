"use client";

import Marquee from "@/components/fx/marquee";
import { useLanguage } from "@/components/providers/language-provider";

export default function MarqueeStrip() {
  const { t } = useLanguage();
  return (
    <section aria-label="Services" className="relative z-10 -my-5">
      <div aria-hidden className="absolute inset-0 rotate-[1deg] scale-x-105 bg-gold-deep/50" />
      <Marquee
        items={t.marquee.items}
        className="relative -rotate-[1.3deg] scale-x-105 border-y border-ink/20 bg-gold py-3.5 text-[#17110A] shadow-card md:py-4"
      />
    </section>
  );
}
