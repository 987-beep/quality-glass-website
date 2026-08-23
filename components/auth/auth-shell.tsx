"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, errMsg, normalizeUsername } from "@/components/providers/auth-provider";
import { useGsap, gsap } from "@/components/fx/use-gsap";
import FramedImage from "@/components/fx/framed-image";
import { prefersReduced } from "@/lib/fx-helpers";
import { SHOP } from "@/lib/site-config";

type Mode = "login" | "signup";

const COPY = {
  login: {
    title: "Welcome back.",
    sub: "Sign in with your @username to track orders, upload payment proof and manage custom framing.",
    cta: "Sign in",
    swapA: "New to Quality Glass?",
    swapB: "Create an account",
    swapHref: "/signup",
  },
  signup: {
    title: "Create your account.",
    sub: "Pick a @username — order frames, upload photos for custom framing and pay securely via UPI.",
    cta: "Create account",
    swapA: "Already have an account?",
    swapB: "Sign in",
    swapHref: "/login",
  },
} as const;

const QUOTE: Record<Mode, string> = {
  login: "Your memories are waiting in their frames.",
  signup: "Some memories deserve more than a screen.",
};

export default function AuthShell({ mode }: { mode: Mode }) {
  const c = COPY[mode];
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const ref = useGsap((el, q) => {
    if (prefersReduced()) return;
    gsap.set(q(".au-in"), { y: 26, opacity: 0 });
    gsap.to(q(".au-in"), {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.06,
      ease: "power3.out",
      delay: 0.15,
    });
    gsap.set(q(".au-frame"), { y: 40, opacity: 0 });
    gsap.to(q(".au-frame"), {
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.18,
      ease: "power3.out",
      delay: 0.3,
    });
  }, []);

  useEffect(() => {
    if (!auth.loading && auth.user) {
      router.replace(params.get("next") || (auth.isAdmin ? "/admin" : "/"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user, auth.isAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");

    if (mode === "signup") {
      if (name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }
      const u = normalizeUsername(username);
      if (u.length < 3) {
        setError("Username must be at least 3 characters (letters, numbers, _).");
        return;
      }
    } else if (!identifier.trim()) {
      setError("Enter your @username or email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await auth.signIn(identifier, password);
        // navigation handled by the effect above
      } else {
        const res = await auth.signUp({
          username,
          email: email.trim() || undefined,
          password,
          name: name.trim(),
        });
        if (res.needsVerification) {
          setNotice(
            "Account created! If your email asks for verification, complete it — then sign in."
          );
          setBusy(false);
        }
      }
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    setBusy(true);
    try {
      await auth.signInWithGoogle();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-xl border border-ivory/15 bg-white/[0.04] px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/35 outline-none transition-colors focus:border-gold/70 focus:bg-white/[0.06]";
  const label =
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50";

  return (
    <main ref={ref} className="relative grid min-h-[100svh] lg:grid-cols-2">
      {/* ambience */}
      <div aria-hidden className="absolute -left-32 top-1/4 h-[380px] w-[380px] rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden className="absolute -right-24 bottom-10 h-[300px] w-[300px] rounded-full bg-gold-light/[0.06] blur-3xl" />

      {/* form side */}
      <div className="relative flex items-center justify-center px-5 py-24 md:px-10">
        <div className="w-full max-w-md">
          <Link href="/" data-cursor="link" className="au-in group inline-flex items-center gap-3">
            <span className="gold-frame flex h-9 w-9 items-center justify-center rounded-[2px] shadow-frame">
              <span className="flex h-[70%] w-[70%] items-end justify-center overflow-hidden bg-ink">
                <svg viewBox="0 0 20 20" className="h-full w-full">
                  <circle cx="6.5" cy="6" r="2.4" fill="#E8CF8F" />
                  <path d="M1 17 L8 7 L12.5 13.5 L15 10 L19 17 Z" fill="#C9A24B" />
                </svg>
              </span>
            </span>
            <span className="font-serif text-lg text-ivory">Quality Glass</span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-ivory/40 group-hover:text-gold-light">
              ← Back to site
            </span>
          </Link>

          <p className="au-in mt-10 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
            {mode === "login" ? "Sign in" : "Join us"}
          </p>
          <h1 className="au-in mt-3 font-serif text-4xl leading-tight text-ivory md:text-5xl">
            {c.title}
          </h1>
          <p className="au-in mt-4 text-sm leading-6 text-ivory/55">{c.sub}</p>

          {!auth.configured && (
            <div className="au-in mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 text-xs leading-5 text-gold-light">
              Backend isn’t connected on this machine yet — add the InsForge keys to{" "}
              <code className="rounded bg-ink px-1.5 py-0.5">.env.local</code> and restart.
            </div>
          )}

          {error && (
            <div className="au-in mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-xs leading-5 text-red-200">
              {error}
            </div>
          )}
          {notice && (
            <div className="au-in mt-6 rounded-xl border border-leaf/40 bg-leaf/10 p-4 text-xs leading-5 text-emerald-100">
              {notice}
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="au-in">
                <label htmlFor="name" className={label}>
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={field}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {mode === "signup" ? (
              <div className="au-in">
                <label htmlFor="username" className={label}>
                  Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-serif text-base italic text-gold-light">
                    @
                  </span>
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`${field} pl-9`}
                    placeholder="yourname"
                    autoComplete="username"
                    required
                  />
                </div>
                <p className="mt-1.5 text-[10px] tracking-wide text-ivory/35">
                  3+ characters — letters, numbers and _ only
                </p>
              </div>
            ) : (
              <div className="au-in">
                <label htmlFor="identifier" className={label}>
                  Username or email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-serif text-base italic text-gold-light">
                    @
                  </span>
                  <input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`${field} pl-9`}
                    placeholder="yourname  or  you@example.com"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="au-in">
                <label htmlFor="email" className={label}>
                  Email <span className="font-normal normal-case tracking-normal text-ivory/30">(optional — for order updates)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            )}

            <div className="au-in">
              <label htmlFor="password" className={label}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${field} pr-12`}
                  placeholder="Minimum 6 characters"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  data-cursor="link"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ivory/40 transition-colors hover:text-gold-light"
                >
                  {showPw ? (
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c7 0 10 7 10 7a17 17 0 0 1-2.9 3.8M6.6 6.6C3.7 8.5 2 12 2 12s3 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || !auth.configured}
              data-cursor="link"
              className="au-in flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ink shadow-glowgold transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              )}
              {busy ? "Please wait…" : c.cta}
            </button>
          </form>

          <div className="au-in mt-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-ivory/10" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/35">or</span>
            <span className="h-px flex-1 bg-ivory/10" />
          </div>

          <button
            onClick={google}
            disabled={busy || !auth.configured}
            data-cursor="link"
            className="au-in mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-ivory/15 px-7 py-4 text-sm font-semibold text-ivory/85 transition-colors hover:border-gold hover:text-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="#EA4335" d="M12 5.3c1.6 0 3 .55 4.1 1.63l3.07-3.07C17.3 2.1 14.8 1 12 1 7.6 1 3.8 3.5 1.9 7.1l3.6 2.8C6.4 7.3 9 5.3 12 5.3z" />
              <path fill="#4285F4" d="M23 12.2c0-.85-.08-1.66-.22-2.45H12v4.65h6.2c-.27 1.4-1.07 2.6-2.28 3.4l3.5 2.7C21.6 18.7 23 15.7 23 12.2z" />
              <path fill="#FBBC05" d="M5.5 14.1a7.2 7.2 0 0 1 0-4.2L1.9 7.1a11 11 0 0 0 0 9.8l3.6-2.8z" />
              <path fill="#34A853" d="M12 23c3.2 0 5.9-1.05 7.9-2.87l-3.5-2.7c-.97.65-2.7 1.03-4.4 1.03-3 0-5.6-2-6.5-4.77l-3.6 2.8C3.8 20.5 7.6 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          <p className="au-in mt-8 text-center text-sm text-ivory/50">
            {c.swapA}{" "}
            <Link href={c.swapHref} data-cursor="link" className="font-semibold text-gold-light hover:underline">
              {c.swapB}
            </Link>
          </p>
          <p className="au-in mt-6 text-center text-[10px] uppercase tracking-[0.24em] text-ivory/25">
            Secured by InsForge · Row-level security
          </p>
        </div>
      </div>

      {/* visual side */}
      <div className="relative hidden items-center justify-center overflow-hidden border-l border-gold/10 lg:flex">
        <div aria-hidden className="absolute right-10 top-20 h-[300px] w-[300px] rounded-full bg-gold/15 blur-3xl" />
        <div className="au-frame relative w-[44%] max-w-[340px] -rotate-[4deg] lg:translate-y-[-6vh]">
          <FramedImage
            src="/images/hero-wedding.jpg"
            alt="Framed wedding photograph"
            tone="gold"
            strokes={false}
            parallax={false}
            aspect="aspect-[4/5]"
            sizes="25vw"
          />
        </div>
        <div className="au-frame animate-floaty absolute bottom-[10vh] right-[12%] w-[30%] max-w-[240px] rotate-[5deg]">
          <FramedImage
            src="/images/cat-custom.jpg"
            alt="Hand-crafted frame making"
            tone="wood"
            strokes={false}
            parallax={false}
            aspect="aspect-[4/5]"
            sizes="20vw"
          />
        </div>
        <blockquote className="au-in absolute bottom-10 left-10 right-10 max-w-sm font-serif text-xl italic leading-8 text-ivory/70">
          “{QUOTE[mode]}”
          <span className="mt-2 block text-[10px] not-italic uppercase tracking-[0.3em] text-gold">
            {SHOP.name} · {SHOP.estd}
          </span>
        </blockquote>
      </div>
    </main>
  );
}
