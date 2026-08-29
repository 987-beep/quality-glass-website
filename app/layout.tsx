import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import SmoothScroll from "@/components/providers/smooth-scroll";
import Preloader from "@/components/preloader";
import CustomCursor from "@/components/custom-cursor";
import ScrollFrame from "@/components/scroll-frame";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import FloatingContact from "@/components/floating-contact";
import ChromeGate from "@/components/chrome-gate";
import PwaRegister from "@/components/pwa-register";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const hindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-hindi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quality Glass Emporium & Photo Framing Center — Raebareli",
  description:
    "Premium photo framing, custom frames, photo printing and glass work at PNT Colony, Raebareli. Rated 4.9 on Justdial. Visit us near Hotel Ganesh, or frame your photo from home.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0A06",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${hindi.variable}`}>
      <body className="grain bg-ink font-sans text-ivory">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Quality Glass Emporium Raebareli",
              alternateName: "Quality Glass Raebareli",
              url: "https://quality-glass-website.vercel.app",
            }),
          }}
        />
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
            <Preloader />
            <PwaRegister />
            <CustomCursor />
            <ChromeGate>
              <ScrollFrame />
            </ChromeGate>
            <SmoothScroll>
              <ChromeGate>
                <Navbar />
              </ChromeGate>
              {children}
              <ChromeGate>
                <Footer />
              </ChromeGate>
            </SmoothScroll>
            <ChromeGate>
              <FloatingContact />
            </ChromeGate>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
