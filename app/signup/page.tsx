import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create account — Quality Framing Emporium & Photo Framing Center, Raebareli",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthShell mode="signup" />
    </Suspense>
  );
}
