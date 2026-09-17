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
import OrderAlerts from "@/components/admin/order-alerts";
import AnalyticsAdmin from "@/components/admin/analytics-admin";
import BookingsAdmin from "@/components/admin/bookings-admin";
import StockAdmin from "@/components/admin/stock-admin";
import WholesaleAdmin from "@/components/admin/wholesale-admin";
import LoyaltyAdmin from "@/components/admin/loyalty-admin";
import SeedDatabaseButton from "@/components/admin/seed-database";

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
  { id: "bookings", label: "Bookings", hi: "बुकिंग" },
  { id: "products", label: "Products", hi: "प्रोडक्ट" },
  { id: "stock", label: "Stock", hi: "स्टॉक" },
  { id: "promos", label: "Promos & Offers", hi: "ऑफर" },
  { id: "wholesale", label: "Wholesale", hi: "होलसेल" },
  { id: "reviews", label: "Reviews", hi: "रिव्यू" },
  { id: "loyalty", label: "Loyalty", hi: "लॉयल्टी" },
  { id: "analytics", label: "Analytics", hi: "एनालिटिक्स" },
  { id: "settings", label: "Settings", hi: "सेटिंग" },
] as const;


/* Studio OS grouping (Linear/Vercel pattern): 11 tabs → 4 sections */
const NAV_GROUPS: { name: string; tabs: (typeof TABS)[number]["id"][] }[] = [
  { name: "Sell", tabs: ["overview", "orders", "bookings", "stock"] },
  { name: "Catalog", tabs: ["products", "wholesale"] },
  { name: "Grow", tabs: ["promos", "reviews", "loyalty"] },
  { name: "System", tabs: ["analytics", "settings"] },
];

const TAB_ICON: Record<(typeof TABS)[number]["id"], string> = {
  overview: "M3 13h4v8H3zM10 9h4v12h-4zM17 5h4v16h-4z",
  orders: "M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21zM9 8h6M9 12h6",
  bookings: "M5 5h14v16H5zM5 9h14M8 3v4M16 3v4",
  stock: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9m0-9L4 7.5",
  products: "M4 5h16v11H4zM4 5l2-2h12l2 2",
  wholesale: "M7 7h.01M3 3h7l9 9-7 7-9-9z",
  promos: "M4 9h13l3 3-3 3H4zM9 9v6",
  reviews: "M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9L6.6 19.6l1.1-6L3.2 9.4l6.1-.8z",
  loyalty: "M12 21s-7.5-4.9-9.8-9.1C.6 8.6 2.3 5 5.7 5c2 0 3.4 1 4.3 2.3h4c.9-1.3 2.3-2.3 4.3-2.3 3.4 0 5.1 3.6 3.5 6.9C19.5 16.1 12 21 12 21z",
  analytics: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6",
  settings: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8 3l-1.8 1.5.2 2.4-2.3.5-1 2.2h-2.6l-1-2.2-2.3-.5.2-2.4L7.6 12l1.8-1.5-.2-2.4 2.3-.5 1-2.2h3l1 2.2 2.3.5-.2 2.4z",
};

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
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tab");
      if (q && TABS.some((t) => t.id === q)) return q as (typeof TABS)[number]["id"];
    }
    return "overview";
  });
  const [more, setMore] = useState(false);
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

  useEffect(() => { 
    if (auth.isAdmin) {
      (async () => {
        await load();
        // Check if database is empty and redirect to seed page
        try {
          const client = getInsforge();
          const { data: cats } = await client.database.from("categories").select("id");
          if (!cats || (Array.isArray(cats) && cats.length < 3)) {
            router.replace("/admin/seed");
          }
        } catch { /* ignore */ }
      })();
    }
  }, [auth.isAdmin, load, router]);

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
              You&apos;re signed in as <span className="text-ivory/85">{auth.user.email}</span> — this studio belongs to the shop owner.
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

  const go = (id: (typeof TABS)[number]["id"]) => { setTab(id); setMore(false); window.scrollTo({ top: 0 }); };

  return (
    <main ref={ref} className="min-h-[100svh] bg-[#0F1114] pb-28 pt-10 md:pt-14 lg:pb-10 lg:pt-0">
      <div className="mx-auto max-w-[1560px] lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">

        {/* ═══ Studio OS sidebar (desktop) ═══ */}
        <aside className="sticky top-0 hidden h-[100svh] flex-col border-r border-ivory/[0.07] bg-[#0F1114] px-5 py-8 lg:flex">
          <div className="px-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Owner Studio</p>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-ivory/45">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> Store live · स्टोर चालू
            </p>
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
            {NAV_GROUPS.map((g) => (
              <div key={g.name}>
                <p className="px-2 text-[9px] font-bold uppercase tracking-[0.28em] text-ivory/28">{g.name}</p>
                <div className="mt-2 flex flex-col gap-0.5">
                  {g.tabs.map((id) => {
                    const t = TABS.find((x) => x.id === id)!;
                    const active = tab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => go(id)}
                        data-cursor="link"
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all ${
                          active
                            ? "bg-gold/[0.12] text-gold-light"
                            : "text-ivory/60 hover:bg-ivory/[0.04] hover:text-ivory"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-ivory/35 group-hover:text-ivory/60"}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d={TAB_ICON[id]} />
                        </svg>
                        <span className="flex-1">{t.label}</span>
                        <span className="text-[9px] opacity-50">{t.hi}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-6 space-y-1 border-t border-ivory/[0.07] pt-4">
            <Link href="/" data-cursor="link"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ivory/55 transition-colors hover:text-gold-light">
              <svg viewBox="0 0 24 24"className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m6-7l-7 7 7 7" /></svg>
              Back to website
            </Link>
            <button onClick={auth.signOut} data-cursor="link"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-ivory/55 transition-colors hover:text-red-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ═══ content column ═══ */}
        <div className="px-5 md:px-10 lg:px-12 lg:py-10">
        {/* top bar (actions stay on every screen) */}
        <div className="ad-in flex flex-wrap items-center justify-between gap-4">
          <Link href="/" data-cursor="link"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-gold-light lg:hidden">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m6-7l-7 7 7 7" />
            </svg>
            Back to website
          </Link>
          <div className="flex items-center gap-3">
            <OrderAlerts />
            <InstallStudioApp />
            <Link href="/admin/users" data-cursor="link"
              className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-light transition-colors hover:bg-gold/20">
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
              className="rounded-full border border-ivory/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light lg:hidden">
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
            Your control room — approve UPI payments, move orders along, tweak products &amp; prices, run offers, and set your QR.
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
            <button key={c.label}
              onClick={() => go(c.label.startsWith("Payments") ? "orders" : c.label.startsWith("Live") ? "products" : "orders")}
              data-cursor="link"
              className={`surface-card press rounded-2xl p-5 text-left transition-colors md:p-6 ${
                c.accent ? "!border-gold/45 bg-gold/[0.06]" : ""
              }`}>
              <Counter value={c.value} className={`font-mono text-3xl tabular-nums tracking-tight md:text-4xl ${c.accent ? "text-gold" : "text-gold-light"}`} />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/40">{c.label}</p>
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
                      Open <span className="text-ivory/85">Orders &amp; Payments</span>, view the screenshot, approve or reject in one tap.</li>
                    <li><span className="mr-2 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink">3</span>
                      Advance it: production → pickup/delivery → completed. Customer sees every step on their account page.</li>
                  </ol>
                </div>
                <div className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-6">
                  <h2 className="font-serif text-xl text-ivory">Coming next</h2>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-ivory/50">
                    <li>· Customer list with WhatsApp shortcuts</li>
                    <li>· Sales-by-category chart &amp; monthly report</li>
                    <li>· Edit homepage hero text from here</li>
                  </ul>
                </div>
                <SeedDatabaseButton />
              </div>
            </section>
          )}
          {tab === "orders" && <OrdersAdmin userId={auth.user.id} />}
          {tab === "bookings" && <BookingsAdmin />}
          {tab === "products" && <ProductsAdmin />}
          {tab === "stock" && <StockAdmin />}
          {tab === "promos" && <PromosAdmin />}
          {tab === "wholesale" && <WholesaleAdmin />}
          {tab === "reviews" && <ReviewsAdmin />}
          {tab === "loyalty" && <LoyaltyAdmin />}
          {tab === "analytics" && (
            <div>
              <h2 className="font-serif text-2xl text-ivory mb-4">Sales Analytics</h2>
              <AnalyticsAdmin />
            </div>
          )}
          {tab === "settings" && <SettingsAdmin />}
        </div>
        </div>
      </div>

      {/* ═══ mobile bottom app bar (phone = primary admin device) ═══ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/[0.08] bg-[#0F1114]/[0.97] pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-1">
          {(["overview", "orders", "bookings", "stock"] as const).map((id) => {
            const t = TABS.find((x) => x.id === id)!;
            const active = tab === id;
            return (
              <button key={id} onClick={() => go(id)} data-cursor="link"
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[9px] font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-gold-light" : "text-ivory/45"
                }`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d={TAB_ICON[id]} />
                </svg>
                {t.label.split(" ")[0]}
              </button>
            );
          })}
          <button onClick={() => setMore(true)} data-cursor="link"
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[9px] font-bold uppercase tracking-wide transition-colors ${
              more ? "text-gold-light" : "text-ivory/45"
            }`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
            </svg>
            More
          </button>
        </div>
      </nav>

      {/* ═══ mobile "More" sheet ═══ */}
      {more && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMore(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto rounded-t-3xl border-t border-ivory/10 bg-[#14171C] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ivory/20" />
            {NAV_GROUPS.map((g) => (
              <div key={g.name} className="mb-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-ivory/30">{g.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {g.tabs.map((id) => {
                    const t = TABS.find((x) => x.id === id)!;
                    return (
                      <button key={id} onClick={() => go(id)} data-cursor="link"
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[13px] font-medium transition-colors ${
                          tab === id
                            ? "border-gold/50 bg-gold/10 text-gold-light"
                            : "border-ivory/10 bg-ivory/[0.03] text-ivory/70"
                        }`}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d={TAB_ICON[id]} />
                        </svg>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
// redeploy Mon Sep  7 13:20:21 UTC 2026
