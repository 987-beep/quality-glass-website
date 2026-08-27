"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getInsforge } from "@/lib/insforge/client";
import Counter from "@/components/fx/counter";
import { useGsap, gsap } from "@/components/fx/use-gsap";
import { prefersReduced } from "@/lib/fx-helpers";
import dynamic from "next/dynamic";
import InstallStudioApp from "@/components/admin/install-studio-app";

const OrdersAdmin = dynamic(() => import("@/components/admin/orders-admin"), { ssr: false });
const ProductsAdmin = dynamic(() => import("@/components/admin/products-admin"), { ssr: false });
const PromosAdmin = dynamic(() => import("@/components/admin/promos-admin"), { ssr: false });
const ReviewsAdmin = dynamic(() => import("@/components/admin/reviews-admin"), { ssr: false });
const SettingsAdmin = dynamic(() => import("@/components/admin/settings-admin"), { ssr: false });

type OrderRow = { id: string; order_no: string; status: string; total_amount: number | string; created_at: string };
type Stats = { pendingProofs: number; ordersToday: number; activeProducts: number; revenue: number };

const STATUS_LABEL: Record<string, string> = {
  payment_pending: "Awaiting payment",
  payment_verifying: "Verifying payment",
  payment_rejected: "Payment rejected",
  paid: "Paid",
  in_production: "In production",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAID_STATUSES = ["paid", "in_production", "ready_for_pickup", "out_for_delivery", "completed"];

const TABS = [
  { id: "overview", label: "Overview", hi: "नज़रिया" },
  { id: "orders", label: "Orders & Payments", hi: "ऑर्डर" },
  { id: "products", label: "Products", hi: "प्रोडक्ट" },
  { id: "promos", label: "Promos & Offers", hi: "ऑफर" },
  { id: "reviews", label: "Reviews", hi: "रिव्यू" },
  { id: "settings", label: "Settings", hi: "सेटिंग" },
] as const;

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

export default function AdminPage() {
  const auth = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(() => {
    // deep-link from app shortcuts, e.g. /admin?tab=orders
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tab");
      if (q && TABS.some((t) => t.id === q)) return q as (typeof TABS)[number]["id"];
    }
    return "overview";
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<OrderRow[]>([]);
  const [statsWarn, setStatsWarn] = useState(false);

  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace("/login?next=/admin");
  }, [auth.loading, auth.user, router]);

  const load = useCallback(async () => {
    try {
      const client = getInsforge();
      const [proofs, orders, products] = await Promise.all([
        client.database.from("payment_proofs").select("id, status"),
        client.database.from("orders").select("id, order_no, status, total_amount, created_at"),
        client.database.from("products").select("id, is_active"),
      ]);
      const p = (proofs.data || []) as { status: string }[];
      const o = (orders.data || []) as OrderRow[];
      const pr = (products.data || []) as { is_active: boolean }[];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setStats({
        pendingProofs: p.filter((x) => x.status === "pending").length,
        ordersToday: o.filter((x) => new Date(x.created_at) >= today).length,
        activeProducts: pr.filter((x) => x.is_active).length,
        revenue: o.filter((x) => PAID_STATUSES.includes(x.status)).reduce((s, x) => s + Number(x.total_amount || 0), 0),
      });
      setRecent([...o].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 5));
      setStatsWarn(false);
    } catch { setStatsWarn(true); }
  }, []);

  useEffect(() => { if (auth.isAdmin) load(); }, [auth.isAdmin, load]);

  const ref = useGsap((el, q) => {
    if (prefersReduced() || !auth.isAdmin) return;
    gsap.set(q(".ad-in"), { y: 24, opacity: 0 });
    gsap.to(q(".ad-in"), { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "power3.out", delay: 0.1 });
  }, [auth.isAdmin]);

  if (auth.loading) return <Splash text="Loading studio…" />;
  if (!auth.user) return <Splash text="Redirecting to sign in…" />;

  if (!auth.isAdmin) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5 py-24">
        <div className="gold-frame w-full max-w-md rounded-[2px] p-[10px] shadow-frame">
          <div className="border border-gold/15 bg-ink-2 p-8 text-center md:p-10">
            <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 text-red-300">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <h1 className="font-serif text-2xl text-ivory">Owner-only area</h1>
            <p className="mt-3 text-sm leading-6 text-ivory/55">
              You’re signed in as <span className="text-ivory/85">{auth.user.email}</span> — this studio belongs to the shop owner.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <button onClick={auth.signOut} data-cursor="link"
                className="w-full rounded-full border border-ivory/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ivory/80 transition-colors hover:border-gold hover:text-gold-light">
                Sign in with another account
              </button>
              <Link href="/" data-cursor="link"
                className="w-full rounded-full bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light">
                Back to website
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const cards = [
    { label: "Payments to verify", value: stats?.pendingProofs ?? 0, accent: true, money: false },
    { label: "Orders today", value: stats?.ordersToday ?? 0, accent: false, money: false },
    { label: "Live products", value: stats?.activeProducts ?? 0, accent: false, money: false },
    { label: "Revenue collected (₹)", value: stats?.revenue ?? 0, accent: false, money: true },
  ];

  return (
    <main ref={ref} className="min-h-[100svh] pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[1240px] px-5 md:px-10">
        {/* top bar */}
        <div className="ad-in flex flex-wrap items-center justify-between gap-4">
          <Link href="/" data-cursor="link"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-gold-light">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m6-7l-7 7 7 7" />
            </svg>
            Back to website
          </Link>
          <div className="flex items-center gap-3">
            <InstallStudioApp />
            <Link
              href="/admin/users"
              data-cursor="link"
              className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-light transition-colors hover:bg-gold/20"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Accounts
            </Link>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-sans text-sm font-bold text-ink">
              {(auth.profile?.full_name || auth.user.email || "O")[0].toUpperCase()}
            </span>
            <button onClick={auth.signOut} data-cursor="link"
              className="rounded-full border border-ivory/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light">
              Sign out
            </button>
          </div>
        </div>

        {/* heading */}
        <div className="ad-in mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Owner Studio · नमस्ते</p>
          <h1 className="mt-3 max-w-[18ch] font-serif text-4xl leading-tight text-ivory md:text-6xl">
            {auth.profile?.full_name ? `Welcome, ${auth.profile.full_name.split(" ")[0]}.` : "Welcome, Owner."}
          </h1>
          {auth.profile?.username && (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold-light">
              @{auth.profile.username}
              <span className="rounded bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-ink">Owner</span>
            </span>
          )}
          <p className="mt-3 max-w-lg text-sm leading-6 text-ivory/50">
            Your control room — approve UPI payments, move orders along, tweak products & prices, run offers, and set your QR.
          </p>
        </div>

        {statsWarn && (
          <div className="ad-in mt-8 rounded-xl border border-gold/40 bg-gold/10 p-4 text-xs text-gold-light">
            Live stats could not be loaded right now — check your connection. The shop itself is unaffected.
          </div>
        )}

        {/* stats */}
        <div className="ad-in mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.label}
              onClick={() => setTab(c.label.startsWith("Payments") ? "orders" : c.label.startsWith("Live") ? "products" : "orders")}
              data-cursor="link"
              className={`rounded-2xl border p-5 text-left transition-colors md:p-6 ${
                c.accent ? "border-gold/45 bg-gold/[0.08] hover:bg-gold/[0.12]" : "border-ivory/10 bg-white/[0.03] hover:border-gold/30"
              }`}
            >
              <Counter value={c.value} className={`font-serif text-3xl md:text-4xl ${c.accent ? "text-gold" : "text-gold-light"}`} />
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ivory/45">{c.label}</p>
            </button>
          ))}
        </div>

        {/* tabs */}
        <div className="ad-in mt-12 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-cursor="link"
              className={`shrink-0 rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                tab === t.id
                  ? "border-gold bg-gold/15 text-gold-light"
                  : "border-ivory/15 text-ivory/55 hover:border-gold/40 hover:text-ivory"
              }`}
            >
              {t.label} <span className="text-[9px] opacity-60">{t.hi}</span>
            </button>
          ))}
        </div>

        {/* panels */}
        <div className="mt-2">
          {tab === "overview" && (
            <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 md:p-6">
                <h2 className="font-serif text-xl text-ivory">Latest orders</h2>
                {recent.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-gold/25 bg-white/[0.02] p-8 text-center text-sm text-ivory/50">
                    No orders yet — when customers order frames and upload UPI payment proof, they appear here for approval.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-ivory/[0.06]">
                    {recent.map((o) => (
                      <button key={o.id} onClick={() => setTab("orders")} data-cursor="link"
                        className="flex w-full flex-wrap items-center justify-between gap-3 py-3 text-left">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-ivory/50">{o.order_no}</span>
                          <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-light">
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-ivory/55">
                          <span className="font-serif text-base text-ivory">₹{Number(o.total_amount).toLocaleString("en-IN")}</span>
                          <span>{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid content-start gap-5">
                <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
                  <h2 className="font-serif text-xl text-ivory">Quick guide · जल्दी सीखें</h2>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-ivory/60">
                    <li><span className="mr-2 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink">1</span>
                      Customer pays your UPI and uploads a screenshot → order turns <span className="text-gold-light">gold: Verify payment</span>.</li>
                    <li><span className="mr-2 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink">2</span>
                      Open <span className="text-ivory/85">Orders & Payments</span>, view the screenshot, approve or reject in one tap.</li>
                    <li><span className="mr-2 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink">3</span>
                      Advance it: production → pickup/delivery → completed. Customer sees every step on their account page.</li>
                  </ol>
                </div>
                <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
                  <h2 className="font-serif text-xl text-ivory">Coming next</h2>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-ivory/50">
                    <li>· Customer list with WhatsApp shortcuts</li>
                    <li>· Sales-by-category chart & monthly report</li>
                    <li>· Edit homepage hero text from here</li>
                  </ul>
                </div>
              </div>
            </section>
          )}
          {tab === "orders" && <OrdersAdmin userId={auth.user.id} />}
          {tab === "products" && <ProductsAdmin />}
          {tab === "promos" && <PromosAdmin />}
          {tab === "reviews" && <ReviewsAdmin />}
          {tab === "settings" && <SettingsAdmin />}
        </div>
      </div>
    </main>
  );
}
