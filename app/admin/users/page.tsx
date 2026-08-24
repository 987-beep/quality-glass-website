"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getInsforge } from "@/lib/insforge/client";

type Customer = {
  id: string;
  email: string;
  emailVerified: boolean;
  providers: string[];
  name: string;
  avatar: string;
  role: string;
  username: string | null;
  phone: string | null;
  joined: string;
  orderCount: number;
  lastOrderAt: string | null;
  isSelf: boolean;
};

type RemoveSummary = { proofs: number; proofFiles: number; orders: number; authUser: boolean };

const joinedFmt = (s: string) =>
  s
    ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

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

export default function AdminUsersPage() {
  const auth = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const token = () =>
    (getInsforge().auth as unknown as { getAccessToken?: () => string | null }).getAccessToken?.() ?? "";

  const toastMsg = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 4000);
  };

  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace("/login?next=/admin/users");
  }, [auth.loading, auth.user, router]);

  const load = useCallback(async () => {
    setErr("");
    const res = await fetch("/api/admin/users", {
      headers: { authorization: `Bearer ${token()}` },
      cache: "no-store",
    });
    const out = await res.json().catch(() => ({} as { ok?: boolean; error?: string; users?: Customer[] }));
    if (!res.ok || !out.ok) throw new Error(out.error || `Could not load accounts (HTTP ${res.status})`);
    setUsers(out.users ?? []);
  }, []);

  useEffect(() => {
    if (auth.isAdmin) {
      load().catch((e) => setErr(e instanceof Error ? e.message : "Something went wrong.")).finally(() => setLoading(false));
    }
  }, [auth.isAdmin, load]);

  const remove = useCallback(async (u: Customer) => {
    setBusyId(u.id);
    setErr("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token()}` },
        body: JSON.stringify({ userId: u.id }),
      });
      const out = await res.json().catch(() => ({} as { ok?: boolean; error?: string; removed?: RemoveSummary }));
      if (!res.ok || !out.ok) throw new Error(out.error || `Remove failed (HTTP ${res.status})`);
      const r = out.removed;
      setConfirmId(null);
      setUsers((xs) => xs.filter((x) => x.id !== u.id));
      toastMsg(
        r
          ? `${u.email} removed ✓ (orders: ${r.orders}, proofs: ${r.proofs})`
          : `${u.email} removed ✓`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }, []);

  if (auth.loading) return <Splash text="Loading studio…" />;
  if (!auth.user) return <Splash text="Redirecting to sign in…" />;

  if (!auth.isAdmin) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5 py-24">
        <div className="gold-frame w-full max-w-md rounded-[2px] p-[10px] shadow-frame">
          <div className="border border-gold/15 bg-ink-2 p-8 text-center md:p-10">
            <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 text-red-300">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <h1 className="font-serif text-2xl text-ivory">Owner-only area</h1>
            <p className="mt-3 text-sm leading-6 text-ivory/55">
              You’re signed in as <span className="text-ivory/85">{auth.user.email}</span> — this page belongs to the shop owner.
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

  return (
    <main className="min-h-[100svh] pb-24 pt-10 md:pt-14">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-full border border-leaf/50 bg-ink px-5 py-2.5 text-center text-xs font-semibold text-leaf shadow-xl">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-[1240px] px-5 md:px-10">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin" data-cursor="link"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-gold-light">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m6-7l-7 7 7 7" />
            </svg>
            Back to studio
          </Link>
          <button onClick={auth.signOut} data-cursor="link"
            className="rounded-full border border-ivory/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:border-gold hover:text-gold-light">
            Sign out
          </button>
        </div>

        {/* heading */}
        <div className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">Owner Studio · सुरक्षा</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ivory md:text-6xl">Customer accounts</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-ivory/50">
            Every account registered on your website. Remove suspicious or fake accounts in one tap —
            their orders, payment proofs and profile are wiped along with the login.
          </p>
        </div>

        {/* warning */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-4 text-xs leading-5 text-red-200/80 md:p-5">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <p>
            Removal is <span className="font-semibold text-red-200">permanent</span> — the account, all of its orders and
            uploaded payment screenshots are deleted forever and cannot be recovered. Admin/owner accounts are protected
            and cannot be removed from here.
          </p>
        </div>

        {err && (
          <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-xs text-red-200">{err}</div>
        )}

        {/* list */}
        {loading ? (
          <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.25em] text-ivory/40">Loading accounts…</p>
        ) : users.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gold/25 bg-white/[0.02] p-10 text-center text-sm text-ivory/50">
            No accounts found.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {users.map((u) => {
              const protectedAcc = u.role === "admin" || u.isSelf;
              const initials = (u.name || u.email || "?").trim()[0]?.toUpperCase() ?? "?";
              return (
                <div key={u.id}
                  className="rounded-2xl border border-ivory/10 bg-white/[0.02] p-5 transition-colors hover:border-gold/25 md:p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* avatar */}
                    {u.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar} alt="" className="h-11 w-11 rounded-full border border-ivory/15 object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 font-sans text-sm font-bold text-gold">
                        {initials}
                      </span>
                    )}

                    {/* identity */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ivory">{u.name || u.email}</p>
                        {u.role === "admin" && (
                          <span className="rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-gold-light">
                            Owner
                          </span>
                        )}
                        {u.isSelf && u.role !== "admin" && (
                          <span className="rounded-full border border-ivory/25 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory/60">
                            You
                          </span>
                        )}
                        {u.providers.map((p) => (
                          <span key={p}
                            className="rounded-full border border-ivory/15 bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ivory/55">
                            {p}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 truncate text-xs text-ivory/50">
                        {u.email}
                        {u.username ? <span className="text-ivory/35"> · @{u.username}</span> : null}
                        {u.phone ? <span className="text-ivory/35"> · {u.phone}</span> : null}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ivory/35">
                        Joined {joinedFmt(u.joined)} · {u.orderCount} order{u.orderCount === 1 ? "" : "s"}
                        {u.lastOrderAt ? ` · last ${joinedFmt(u.lastOrderAt)}` : ""}
                      </p>
                    </div>

                    {/* action */}
                    {!protectedAcc && (
                      <div className="flex items-center gap-2">
                        {confirmId === u.id ? (
                          <>
                            <button
                              onClick={() => remove(u)}
                              disabled={busyId === u.id}
                              data-cursor="link"
                              className="rounded-full border border-red-400/60 bg-red-500/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-200 transition-colors hover:bg-red-500/25 disabled:opacity-50">
                              {busyId === u.id ? "Removing…" : "Yes, delete forever"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              disabled={busyId === u.id}
                              data-cursor="link"
                              className="rounded-full border border-ivory/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/60 transition-colors hover:border-ivory/40">
                              Keep
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmId(u.id)}
                            data-cursor="link"
                            className="inline-flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/60 transition-colors hover:border-red-400/60 hover:text-red-300">
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6" />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-[10px] uppercase tracking-[0.25em] text-ivory/25">
          {users.length} account{users.length === 1 ? "" : "s"} total · reviews left by removed users stay published but lose their account link
        </p>
      </div>
    </main>
  );
}
