"use client";

import { useLanguage } from "@/components/providers/language-provider";
import Counter from "@/components/fx/counter";

export default function Stats() {
  const { t } = useLanguage();

  return (
    <section id="story" className="border-y border-gold/10 bg-ink-2 py-16 md:py-20">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-12 px-5 md:px-10 lg:grid-cols-4">
        {t.stats.items.map((s) => (
          <div key={s.label} className="border-l border-gold/20 pl-5 md:pl-8">
            <Counter
              value={s.value}
              suffix={s.suffix}
              decimals={s.decimals}
              className="font-serif text-4xl text-gold-light md:text-6xl"
            />
            <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-ivory/45 md:text-[11px]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
