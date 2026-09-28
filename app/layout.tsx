import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quality Glass Emporium — Nayi Website Par Shift Ho Gaye! 🎉",
  description:
    "Quality Glass Emporium Raebareli ab apni nayi website par shift ho gaya hai. Visit: quality-glass.pages.dev",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
