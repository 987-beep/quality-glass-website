import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight in-memory rate limiting for the API surface.
 *
 * The Next server is started with a long-lived process (Vercel serverless
 * instances also reuse warm instances), so a per-instance Map gives us solid
 * abuse protection. It deliberately prefers over-blocking to silently
 * intermediating every request to InsForge.
 *
 * Buckets (per IP, sliding 60s window):
 *   login/signup attempts      → 8 / 60 s     (brute-force stopper)
 *   proof/QR upload intents    → 6 / 60 s
 *   writes to sensitive tables → 20 / 60 s
 *   every other /api call      → 120 / 60 s   (generous, only stops floods)
 */

const buckets = new Map<string, { count: number; reset: number }>();
let lastSweep = Date.now();

function bucketName(pathname: string, method: string) {
  if (pathname.startsWith("/api/auth/")) return "auth";
  if (pathname.startsWith("/api/storage/") && method !== "GET") return "upload";
  if (pathname.startsWith("/api/database/") && method !== "GET") return "dbwrite";
  return "api";
}

const LIMITS: Record<string, number> = {
  auth: 8,
  upload: 6,
  dbwrite: 20,
  api: 120,
};

function isRateLimited(key: string, limit: number, now = Date.now()): { limited: boolean; retryAfter: number } {
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + 60_000 });
    return { limited: false, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { limited: true, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
  }
  return { limited: false, retryAfter: 0 };
}

function clientKey(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export function middleware(req: NextRequest) {
  const now = Date.now();
  if (now - lastSweep > 120_000) {
    lastSweep = now;
    buckets.forEach((v, k) => { if (v.reset < now) buckets.delete(k); });
  }

  const bucket = bucketName(req.nextUrl.pathname, req.method);
  const key = `${bucket}:${clientKey(req)}`;
  const { limited, retryAfter } = isRateLimited(key, LIMITS[bucket]);
  if (!limited) return NextResponse.next();

  return new NextResponse(
    JSON.stringify({ error: "RATE_LIMITED", message: "Too many requests — slow down, please." }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfter),
      },
    }
  );
}

export const config = { matcher: "/api/:path*" };
