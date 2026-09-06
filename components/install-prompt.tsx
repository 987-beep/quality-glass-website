"use client";

import { useEffect, useState } from "react";

/** Chrome/Safari fire this when the page advertises a manifest + SW is up. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Customer-facing "Install the app" pill for the Quality Framing Raebareli PWA.
 * Only shows where the browser supports install; hides after install or dismiss.
 * Suppresses Chrome's own auto-banner (we show our own, one-time, dismissible).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    if (localStorage.getItem("qf-install-dismissed")) return;
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => { setInstalled(true); localStorage.setItem("qf-install-dismissed", "1"); };
    window.addEventListener("beforeinstallprompt", onPrompt as unknown as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[80] flex items-center gap-3 rounded-full border border-gold/35 bg-ink/90 py-2 pl-2 pr-3 shadow-glowgold backdrop-blur-md">
      <span className="gold-frame flex h-9 w-9 items-center justify-center rounded-[2px]">
        <span className="flex h-[78%] w-[78%] items-center justify-center overflow-hidden bg-ink">
          <svg viewBox="0 0 20 20" className="h-full w-full">
            <text x="10" y="13.4" textAnchor="middle" fontSize="10.5" fontWeight="700"
              fontFamily="Georgia, 'Times New Roman', serif" fill="#E8CF8F">QF</text>
          </svg>
        </span>
      </span>
      <div className="flex flex-col leading-tight">
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            if (outcome === "accepted") setInstalled(true);
          }}
          data-cursor="link"
          className="text-xs font-bold uppercase tracking-[0.12em] text-gold-light hover:text-gold"
        >
          Install app
        </button>
        <span className="text-[10px] text-ivory/45">frame &amp; track on your phone</span>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        data-cursor="link"
        onClick={() => { localStorage.setItem("qf-install-dismissed", "1"); setDeferred(null); }}
        className="ml-1 text-ivory/40 hover:text-ivory"
      >
        ✕
      </button>
    </div>
  );
}
