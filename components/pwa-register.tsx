"use client";

import { useEffect } from "react";

/**
 * Owner Studio PWA — strictly owner-only.
 *  - On /admin surfaces: register the service worker (install/requirements).
 *  - On ALL other pages: actively UNREGISTER any previously installed service worker.
 *    The manifest is only advertised from /admin layouts, so customers never
 *    see an install prompt, and anyone who picked one up earlier gets it torn down.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const ownerOnly = /^\/admin(\/|$)/.test(window.location.pathname);
    const run = () => {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          if (ownerOnly) {
            navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
          } else {
            regs.forEach((r) => r.unregister().catch(() => {}));
          }
        })
        .catch(() => {});
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
    return () => window.removeEventListener("load", run);
  }, []);
  return null;
}
