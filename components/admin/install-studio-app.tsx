"use client";

import { useEffect, useState } from "react";

/** Chrome fires this when the page (admin-only here) advertises a manifest
 *  + the service worker is up. Held in memory until the owner taps the button. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * "Install Owner Studio app" — lives INSIDE the studio. The manifest/service
 * worker exist only on /admin, so this prompt is only ever capturable here;
 * customers never trigger it anywhere on the public site.
 */
export default function InstallStudioApp() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true); // already running as the app
    }
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // kill Chrome's own auto-banner entirely
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/[0.07] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-gold-light">
        ✓ Studio app installed
      </span>
    );
  }

  if (!deferred) return null; // browser not ready / unsupported

  return (
    <button
      type="button"
      onClick={async () => {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") setInstalled(true);
        setDeferred(null);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-gold/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light transition hover:bg-gold/25 active:scale-[0.97]"
    >
      ⬇ Install Owner Studio app
    </button>
  );
}
