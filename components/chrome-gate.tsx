"use client";

import { usePathname } from "next/navigation";

/** Routes that render without the public site chrome (nav, footer, floating buttons). */
const BARE_ROUTES = ["/admin", "/login", "/signup", "/account"];

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const p = usePathname() || "";
  if (BARE_ROUTES.some((r) => p === r || p.startsWith(r + "/"))) return null;
  return <>{children}</>;
}
