"use client";

import { useEffect } from "react";

/** Registers the Owner Studio service worker on owner-only surfaces (/admin, /login).
 *  Customer pages never trigger the service worker or install prompts. */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!/^\/(admin|login)(\/|$)/.test(window.location.pathname)) return;
    const onLoad = () =>
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
