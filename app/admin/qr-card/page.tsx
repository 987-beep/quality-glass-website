"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { SHOP } from "@/lib/site-config";

const SITE_QR = "/api/storage/buckets/content/objects/card-qr-site.png";
const REVIEW_QR = "/api/storage/buckets/content/objects/card-qr-justdial.png";

function Splash({ text }: { text: string }) {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="gold-frame flex h-12 w-12 items-center justify-center rounded-[2px] shadow-frame">
        <span className="block h-[60%] w-[60%] animate-pulse bg-ink" />
      </span>
      <p className="text-xs uppercase tracking-[0.3em] text-ivory/45">{text}</p>
    </main>
  );
}

function Card({
  qr,
  title,
  sub,
  foot,
}: {
  qr: string;
  title: string;
  sub: string;
  foot: string;
}) {
  return (
    <div className="flex w-[320px] flex-col items-center rounded-2xl border-2 border-gold/70 bg-[#0c0a06] p-7 text-center shadow-frame">
      <p className="font-serif text-xl leading-tight text-gold">{SHOP.name}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.3em] text-ivory/50">{SHOP.unit}</p>
      <div className="mt-5 rounded-xl bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR code" className="h-48 w-48 object-contain" />
      </div>
      <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-ivory">{title}</p>
      <p className="mt-1.5 text-[11px] leading-5 text-ivory/60">{sub}</p>
      <p className="mt-4 border-t border-gold/20 pt-3 text-[9px] uppercase tracking-[0.2em] text-ivory/40">{foot}</p>
    </div>
  );
}

export default function QrCardPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace("/login?next=/admin/qr-card");
  }, [auth.loading, auth.user, router]);

  if (auth.loading) return <Splash text="Loading…" />;
  if (!auth.user) return <Splash text="Redirecting to sign in…" />;
  if (!auth.isAdmin) return <Splash text="Owner-only area." />;

  return (
    <main className="min-h-[100svh] pb-20 pt-10 md:pt-14">
      {/* print styles: show only the cards on paper */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .qr-print-area, .qr-print-area * { visibility: visible; }
          .qr-print-area { position: absolute !important; inset: 0 !important; margin: 0 !important;
            display: flex !important; flex-direction: row !important; flex-wrap: wrap !important;
            align-items: flex-start !important; justify-content: center !important;
            gap: 24px !important; padding: 24px !important; }
          .qr-print-area > div { box-shadow: none !important; break-inside: avoid; }
        }
        @page { margin: 10mm; }
      `}</style>

      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <div className="qr-no-print flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin" data-cursor="link"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-gold-light">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m6-7l-7 7 7 7" />
            </svg>
            Back to studio
          </Link>
          <button
            onClick={() => window.print()}
            data-cursor="link"
            className="rounded-full bg-gold px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-light"
          >
            🖨 Print cards
          </button>
        </div>

        <div className="qr-no-print mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Owner Studio · दुकान के लिए</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ivory md:text-5xl">Counter QR cards</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-ivory/50">
            Print these cards and keep them at your counter — one lets customers order online,
            the other collects Justdial reviews. Print at A5 or A6 size for best results.
          </p>
        </div>

        <div className="qr-print-area mt-10 flex flex-wrap items-start justify-center gap-8">
          <Card
            qr={SITE_QR}
            title="Scan to order online"
            sub="Frames, prints, posters & stickers — order from home, pay by UPI, pickup or local delivery."
            foot="quality-glass-website.vercel.app"
          />
          <Card
            qr={REVIEW_QR}
            title="Love our work? Rate us ★"
            sub={`Your 5-star review on Justdial keeps our ${SHOP.estd}-born shop growing. Scan and tap — takes 30 seconds.`}
            foot={`Rated ${SHOP.rating} ★ on Justdial`}
          />
        </div>

        <p className="qr-no-print mt-10 text-center text-[10px] uppercase tracking-[0.25em] text-ivory/25">
          Tip: laminate the printed cards so they survive the counter
        </p>
      </div>
    </main>
  );
}
