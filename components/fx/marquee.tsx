"use client";

type Props = {
  items: string[];
  className?: string;
  slow?: boolean;
};

/** Infinite marquee ribbon. Skews with scroll velocity via --mq-skew. */
export default function Marquee({ items, className = "", slow = false }: Props) {
  const row = (hidden: boolean) => (
    <div key={String(hidden)} aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 font-serif text-lg tracking-wide md:px-10 md:text-2xl">
            {it}
          </span>
          <span className="inline-block h-2 w-2 rotate-45 bg-current opacity-60" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="mq-skew overflow-hidden">
      <div className={`overflow-hidden ${className}`}>
        <div className={`flex w-max ${slow ? "animate-mq-slow" : "animate-mq"}`}>
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
