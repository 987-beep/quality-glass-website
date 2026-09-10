"use client";

import { useEffect } from "react";

/**
 * Progressive Web App — "Quality Glass Raebareli".
 * Registers the service worker on EVERY page so customers can install the
 * app for quick ordering + order tracking. Offline-friendly for static assets.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const run = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
    return () => window.removeEventListener("load", run);
  }, []);
  return null;
}
