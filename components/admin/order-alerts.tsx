"use client";

import { useEffect, useRef, useState } from "react";
import { getInsforge } from "@/lib/insforge/client";

/**
 * New-order beacon (studio only): polls every 60 s for new orders;
 * on a fresh one → sound pulse + system notification (if allowed) + gold dot badge.
 * No server needed — runs entirely in the studio tab/app. */
export default function OrderAlerts() {
  const [pending, setPending] = useState(0);
  const [flash, setFlash] = useState(false);
  const knownIds = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await getInsforge().database
          .from("orders")
          .select("id, order_no, status")
          .in("status", ["payment_pending", "payment_verifying"])
          .order("created_at", { ascending: false });
        const rows = (data as { id: string; order_no: string }[]) ?? [];
        setPending(rows.length);

        const fresh = rows.filter((r) => !knownIds.current.has(r.id));
        if (primed.current && fresh.length) {
          setFlash(true);
          setTimeout(() => setFlash(false), 6000);
          // soft beep
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880; gain.gain.value = 0.08;
            osc.start(); osc.stop(ctx.currentTime + 0.3);
          } catch { /* silent */ }
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("🛎 New order!", {
              body: `${fresh.length} new — open Needs action in Orders.`,
              icon: "/icons/icon-192.png",
            });
          }
        }
        knownIds.current = new Set(rows.map((r) => r.id));
        primed.current = true;
      } catch { /* offline — skip tick */ }
    };

    // ask permission once (after the page is alive)
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      const t = setTimeout(() => Notification.requestPermission().catch(() => {}), 4000);
      check();
      const i = setInterval(check, 60_000);
      return () => { clearTimeout(t); clearInterval(i); };
    }
    check();
    const i = setInterval(check, 60_000);
    return () => clearInterval(i);
  }, []);

  if (!pending) return null;
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
        flash ? "border-gold bg-gold text-ink animate-pulse" : "border-gold/40 bg-gold/10 text-gold-light"
      }`}
      title="orders waiting for action"
    >
      🛎 {pending} pending
    </span>
  );
}
