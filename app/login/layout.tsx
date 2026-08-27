import type { Metadata } from "next";

/** Owner-only install surface (login → /admin). */
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
