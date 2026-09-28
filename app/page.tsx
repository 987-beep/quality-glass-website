"use client";

import { useEffect, useState } from "react";

const NEW_SITE = "https://quality-glass.pages.dev/";

export default function MovedPage() {
  const [secs, setSecs] = useState(8);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (secs === 0) window.location.href = NEW_SITE;
  }, [secs]);

  return (
    <main style={s.page}>
      <div style={s.card}>
        {/* Logo mark */}
        <div style={s.logoWrap}>
          <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
            <rect x="6" y="6" width="60" height="60" rx="10" fill="none" stroke="#C9A24B" strokeWidth="3" />
            <rect x="16" y="16" width="40" height="40" rx="6" fill="none" stroke="#C9A24B" strokeWidth="2" opacity="0.55" />
            <path d="M30 46 L30 26 L43 26 M30 36 L41 36" stroke="#C9A24B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <p style={s.eyebrow}>QUALITY GLASS EMPORIUM · RAEBARELI</p>

        <h1 style={s.h1}>
          Hum <span style={s.gold}>shift</span> ho gaye! 🎉
        </h1>
        <p style={s.hi}>
          We&apos;ve moved to our <b style={{ color: "#E8CF8F" }}>brand-new website</b> —
          faster, prettier aur bilkul naya experience.
        </p>

        {/* Redirect notice */}
        <div style={s.redirectBox}>
          {secs > 0 ? (
            <>
              <span style={s.dot} />
              {secs} second mein aap khud <b>nayi website</b> par pahunch jaoge…
            </>
          ) : (
            <>Nayi website khol rahe hain…</>
          )}
        </div>

        <a href={NEW_SITE} style={s.btn}>
          Nayi Website Kholo — quality-glass.pages.dev
          <span aria-hidden="true" style={{ marginLeft: 10 }}>→</span>
        </a>

        <p style={s.small}>
          Ab se humari <b>asli website</b> sirf ye hai:{" "}
          <a href={NEW_SITE} style={s.link}>quality-glass.pages.dev</a>
        </p>

        <div style={s.divider} />

        <p style={s.foot}>
          Purani site (ye wali) ab <b>band</b> ho chuki hai — saare frames, offers aur
          order tracking ab nayi website par milegi. Dhanyavaad! 🙏
        </p>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
    background:
      "radial-gradient(1200px 800px at 50% -10%, #241a0c 0%, #131008 55%, #0b0906 100%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', 'Hind', sans-serif",
    color: "#eae2cf",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    textAlign: "center",
    padding: "48px 34px 40px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(201,162,75,0.35)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
    boxSizing: "border-box",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: 18 },
  eyebrow: {
    letterSpacing: "0.28em",
    fontSize: 11,
    color: "#b39a63",
    margin: "0 0 14px",
    fontWeight: 700,
  },
  h1: {
    fontSize: "clamp(30px, 6vw, 44px)",
    margin: "0 0 10px",
    fontWeight: 800,
    lineHeight: 1.12,
    color: "#f5ecd6",
  },
  gold: { color: "#C9A24B" },
  hi: { fontSize: 16, color: "#cfc3a4", margin: "0 0 22px", lineHeight: 1.55 },
  redirectBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    fontSize: 13.5,
    color: "#d9cbA4",
    background: "rgba(201,162,75,0.12)",
    border: "1px solid rgba(201,162,75,0.28)",
    padding: "10px 16px",
    borderRadius: 999,
    marginBottom: 24,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#C9A24B",
    display: "inline-block",
    animation: "pulse 1s infinite alternate",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 22px",
    fontSize: 16.5,
    fontWeight: 800,
    color: "#171204",
    background: "linear-gradient(180deg,#E8CF8F 0%,#C9A24B 55%,#A87F2C 100%)",
    borderRadius: 14,
    textDecoration: "none",
    border: "1px solid #E8CF8F",
    boxShadow: "0 12px 30px rgba(201,162,75,0.35)",
    marginBottom: 18,
  },
  small: { fontSize: 13.5, color: "#a4936b", margin: "0 0 6px", lineHeight: 1.6 },
  link: { color: "#E8CF8F", fontWeight: 700, textDecoration: "none", borderBottom: "1px dashed #C9A24B" },
  divider: { height: 1, background: "rgba(201,162,75,0.22)", margin: "22px auto", width: "70%" },
  foot: { fontSize: 12.5, color: "#8d805f", lineHeight: 1.65, margin: 0 },
};
