"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { formatINR } from "@/lib/format";
import type { Category } from "@/lib/server/catalog";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc" | "newest";

const COPY = {
  en: {
    filters: "Filters",
    categories: "Categories",
    priceRange: "Price Range",
    sortBy: "Sort by",
    all: "All",
    clear: "Clear all",
    apply: "Show results",
    search: "Search frames…",
    recent: "Recent searches",
    noSuggest: "No matches",
    sorts: {
      featured: "Featured first",
      "price-asc": "Price: Low to High",
      "price-desc": "Price: High to Low",
      "name-asc": "Name: A–Z",
      newest: "Newest",
    },
  },
  hi: {
    filters: "फ़िल्टर",
    categories: "श्रेणियाँ",
    priceRange: "मूल्य सीमा",
    sortBy: "क्रमबद्ध करें",
    all: "सभी",
    clear: "सब हटाएँ",
    apply: "परिणाम देखें",
    search: "फ्रेम खोजें…",
    recent: "हाल की खोज",
    noSuggest: "कुछ नहीं मिला",
    sorts: {
      featured: "फ़ीचर्ड पहले",
      "price-asc": "मूल्य: कम से ज़्यादा",
      "price-desc": "मूल्य: ज़्यादा से कम",
      "name-asc": "नाम: A–Z",
      newest: "नए",
    },
  },
};

const RECENT_KEY = "qg_recent_searches";

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a.slice(0, 5) : [];
  } catch { return []; }
}

export function pushRecentSearch(q: string) {
  const term = q.trim();
  if (!term || typeof window === "undefined") return;
  try {
    const list = readRecentSearches().filter((s) => s.toLowerCase() !== term.toLowerCase());
    list.unshift(term);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
  } catch { /* noop */ }
}

/* ---------- Expanding search bar with autocomplete ---------- */
export function SearchBar({
  value,
  onChange,
  suggestions,
  onPick,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: { slug: string; label: string }[];
  onPick: (label: string) => void;
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecent(readRecentSearches()), [focused]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showPanel = focused && (value.length > 0 || recent.length > 0);

  return (
    <div ref={boxRef} className="relative w-full md:w-auto">
      <div
        className={`flex items-center gap-2.5 rounded-full border bg-white/[0.03] px-4 transition-all duration-400 ${
          focused ? "border-gold/60 shadow-glowgold" : "border-ivory/15"
        }`}
        style={{ width: "100%", maxWidth: focused ? 360 : 280 }}
      >
        <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 transition-colors ${focused ? "text-gold" : "text-ivory/40"}`} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) { pushRecentSearch(value); setFocused(false); }
            if (e.key === "Escape") setFocused(false);
          }}
          placeholder={c.search}
          className="w-full bg-transparent py-3 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none"
        />
        {value && (
          <button onClick={() => onChange("")} aria-label="Clear search" className="shrink-0 text-ivory/40 transition-colors hover:text-gold">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {showPanel && (
        <div
          className="absolute left-0 top-full z-40 mt-2 w-full min-w-[280px] overflow-hidden rounded-2xl border border-gold/20 bg-ink-2/98 shadow-2xl backdrop-blur-xl md:w-[360px]"
          style={{ animation: "fadeSlideDown 220ms ease-out" }}
        >
          {value.length > 0 ? (
            suggestions.length ? (
              <ul className="max-h-72 overflow-y-auto py-2">
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <button
                      onClick={() => { onPick(s.label); pushRecentSearch(s.label); setFocused(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ivory/75 transition-colors hover:bg-gold/10 hover:text-gold-light"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-ivory/30" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-center text-xs text-ivory/40">{c.noSuggest}</p>
            )
          ) : (
            <div className="py-2">
              <p className="px-4 pb-1.5 pt-1 text-[10px] uppercase tracking-[0.22em] text-gold/70">{c.recent}</p>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => { onChange(r); setFocused(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ivory/65 transition-colors hover:bg-gold/10 hover:text-gold-light"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-ivory/30" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Sort dropdown ---------- */
export function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const keys: SortKey[] = ["featured", "price-asc", "price-desc", "name-asc", "newest"];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2.5 rounded-full border px-4 py-3 text-xs font-semibold transition-all ${
          open ? "border-gold/60 text-gold" : "border-ivory/15 text-ivory/65 hover:border-gold/40 hover:text-gold-light"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
        <span className="hidden sm:inline">{c.sorts[value]}</span>
        <span className="sm:hidden">{c.sortBy}</span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-gold/20 bg-ink-2/98 py-2 shadow-2xl backdrop-blur-xl"
          style={{ animation: "fadeSlideDown 200ms ease-out" }}
        >
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpen(false); }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-gold/10 ${
                value === k ? "text-gold" : "text-ivory/65 hover:text-gold-light"
              }`}
            >
              {c.sorts[k]}
              {value === k && <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Price range dual slider ---------- */
export function PriceRange({
  min, max, value, onChange,
}: {
  min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void;
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const [lo, hi] = value;
  const pct = (n: number) => ((n - min) / Math.max(1, max - min)) * 100;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{c.priceRange}</p>
        <p className="font-serif text-sm text-gold-light">{formatINR(lo)} – {formatINR(hi)}</p>
      </div>
      <div className="relative h-7">
        <div className="absolute top-3 h-[3px] w-full rounded-full bg-ivory/12" />
        <div
          className="absolute top-3 h-[3px] rounded-full bg-gold"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range" min={min} max={max} step={50} value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 50), hi])}
          className="qg-range absolute top-0 h-7 w-full appearance-none bg-transparent"
          aria-label="Minimum price"
        />
        <input
          type="range" min={min} max={max} step={50} value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 50)])}
          className="qg-range absolute top-0 h-7 w-full appearance-none bg-transparent"
          aria-label="Maximum price"
        />
      </div>
    </div>
  );
}

/* ---------- Category list (sidebar / drawer) ---------- */
export function CategoryList({
  categories, active, onSelect, counts,
}: {
  categories: Category[];
  active: string;
  onSelect: (slug: string) => void;
  counts: Record<string, number>;
}) {
  const { lang } = useLanguage();
  const c = COPY[lang as "en" | "hi"] || COPY.en;
  const all = [{ id: "all", slug: "all", name: { en: c.all, hi: c.all } } as Category, ...categories];

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{c.categories}</p>
      <ul className="space-y-0.5">
        {all.map((cat) => {
          const on = active === cat.slug;
          const n = cat.slug === "all" ? counts.__all ?? 0 : counts[cat.slug] ?? 0;
          return (
            <li key={cat.slug}>
              <button
                onClick={() => onSelect(cat.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ${
                  on ? "bg-gold/12 text-gold" : "text-ivory/60 hover:bg-white/[0.03] hover:text-gold-light"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full transition-all ${on ? "bg-gold" : "bg-ivory/20"}`} />
                  {cat.name[lang as "en" | "hi"] || cat.name.en || cat.slug}
                </span>
                <span className={`text-[10px] tabular-nums ${on ? "text-gold/70" : "text-ivory/25"}`}>{n}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { COPY as FILTER_COPY };
