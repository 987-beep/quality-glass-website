import type { Metadata } from "next";
import StudioClient from "@/components/studio/studio-client";

export const metadata: Metadata = {
  title: "Custom Framing Studio — frame your photo online | Quality Framing Emporium, Raebareli",
  description:
    "Upload your photo and watch it in a real frame — choose size, moulding, glass and mat, see the live price and order on WhatsApp. Custom framing in Raebareli by Quality Framing Emporium, PNT Colony.",
};

export default function StudioPage() {
  return (
    <>
      <StudioClient />
    </>
  );
}
