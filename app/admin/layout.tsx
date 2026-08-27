import type { Metadata } from "next";

/** Owner-only surface: the PWA manifest is advertised here (and login), nowhere else —
 *  customers browsing the shop never see an install prompt. */
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
