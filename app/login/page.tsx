import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign in — Quality Glass Emporium & Photo Framing Center, Raebareli",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthShell mode="login" />
    </Suspense>
  );
}
