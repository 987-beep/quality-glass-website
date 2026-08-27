/**
 * Server-only InsForge relay — the MASTER ik_ key never leaves the server.
 *
 * The browser talks to /api/{auth,database,storage}/* on THIS origin; these
 * handlers attach the project key and forward to InsForge. An allow-list
 * decides what a browser may call:
 *
 *   auth      → only user-scoped endpoints (login, signup, refresh, me…)
 *               admin user-management & rawsql are NOT reachable, period.
 *   database  → public tables: anonymous GET allowed
 *               everything else: a real user session JWT is required
 *               (InsForge then scopes every query with RLS + write-guard triggers)
 *   storage   → public-bucket GETs anonymous; everything else needs a JWT
 *
 * The project key is never placed in any client bundle.
 */

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";

if (!INSFORGE_URL || !INSFORGE_API_KEY) {
  console.warn("[insforge-relay] INSFORGE_URL / INSFORGE_API_KEY missing in server env");
}

/* ---------- allow-lists ---------- */

/** auth endpoints a browser may call: [method, path-prefix] */
const ALLOWED_AUTH: Array<[string, string]> = [
  ["POST", "sessions"], // login
  ["DELETE", "sessions"], // logout own session
  ["POST", "sessions/logout"],
  ["POST", "refresh"], // session refresh (csrf + cookie pass through)
  ["POST", "users"], // signup
  ["GET", "users/current"], // current user
  ["PATCH", "users/current"], // update own auth record (name…)
  ["DELETE", "users/current"],
  ["GET", "oauth"], // oauth start/callback redirects
  ["POST", "oauth"],
  ["POST", "email/verification"], // resend verification (if ever enabled)
  ["POST", "password/forgot"],
  ["POST", "password/reset"],
  ["POST", "password/change"],
];

/** database tables an anonymous visitor may READ (SELECT only) */
const PUBLIC_READ_TABLES = new Set([
  "products",
  "categories",
  "product_images",
  "frame_options",
  "promos",
  "reviews",
  "content_blocks",
  "site_settings",
]);

/** storage buckets whose objects are public */
const PUBLIC_BUCKETS = new Set(["products", "content"]);

/* ---------- relay core ---------- */

function upstreamUrl(parts: string[], search: string) {
  const seg = parts.map(encodeURIComponent).join("/");
  return `${INSFORGE_URL}/api/${seg}${search || ""}`;
}

/**
 * A header is a real user session ONLY if it carries an actual JWT
 * (InsForge JWTs are compact JWS strings starting with "eyJ").
 * The SDK also sends its placeholder anon-key as Bearer — that is NOT a
 * user session and must be treated as "anonymous".
 */
function extractUserJwt(req: Request): string | null {
  const raw = req.headers.get("authorization");
  return raw && /^Bearer\s+eyJ/i.test(raw) ? raw : null;
}

async function relay(
  req: Request,
  upstream: string,
  authorization: string | null,
  bodyOverride?: Buffer,
  opts?: { forwardCookie?: boolean }
): Promise<Response> {
  const headers = new Headers();
  headers.set("apikey", INSFORGE_API_KEY);
  // InsForge treats "a token" as the anon/service credential; when the browser
  // supplied no real user JWT we act with the server-held key. Every anonymous
  // path reaching here is already allow-listed (signup, public reads, oauth…).
  headers.set("authorization", authorization ?? `Bearer ${INSFORGE_API_KEY}`);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  // pass through headers the InsForge auth flow relies on
  for (const h of ["x-csrf-token", "prefer", "range", "accept"]) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }
  // Without this the refresh-token cookie (bound to OUR origin by the set-cookie
  // rewrite below) never reaches InsForge: silent refresh 401s and every session
  // dies when its short-lived access token expires. Forward cookies on the
  // auth surface so refresh/OAuth flows can complete.
  if (opts?.forwardCookie) {
    const cookie = req.headers.get("cookie");
    if (cookie) headers.set("cookie", cookie);
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const raw = bodyOverride ?? (hasBody ? Buffer.from(await req.arrayBuffer()) : undefined);
  // DOM fetch types reject Node Buffer — pass a Uint8Array body instead
  const body = raw === undefined ? undefined : new Uint8Array(raw);

  const res = await fetch(upstream, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const outHeaders = new Headers();
  const rct = res.headers.get("content-type");
  if (rct) outHeaders.set("content-type", rct);
  const loc = res.headers.get("location");
  if (loc) outHeaders.set("location", loc);
  // forward Set-Cookie (refresh-token cookie) but strip Domain so it binds to our origin
  // (Next/undici exposes them via getSetCookie when available)
  const anyHeaders = res.headers as Headers & { getSetCookie?: () => string[] };
  const cookies =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : [res.headers.get("set-cookie")].filter((c): c is string => Boolean(c));
  for (const c of cookies ?? []) {
    outHeaders.append(
      "set-cookie",
      c.replace(/;\s*Domain=[^;]*/i, "")
    );
  }
  outHeaders.set("cache-control", "no-store");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders,
  });
}

const deny = (msg: string, status = 403) =>
  Response.json({ error: "BLOCKED_BY_PROXY", message: msg }, { status });

/* ---------- bot shield (honeypot + fill-time) ---------- */

const BOT_MIN_FILL_MS = 3000;

/**
 * Human gate for public write forms (signup, tracking, reviews…).
 * Real users never see the hidden "website" field (bots fill anything they
 * find), and nobody legitimately completes a form in under 3 seconds.
 * Returns a blocking Response on suspicion, otherwise the request body with
 * our scanner fields stripped out, ready to forward.
 */
export async function humanGate(req: Request, fields = ["website", "_t"]): Promise<Buffer | Response> {
  try {
    const raw = await req.json();
    const hp = raw?.website;
    const t = Number(raw?._t);
    const now = Date.now();
    const trapTriggered = hp !== undefined && hp !== null && String(hp).trim() !== "";
    const tooFast = !Number.isFinite(t) || now - t < BOT_MIN_FILL_MS || now - t > 86_400_000;
    if (trapTriggered || tooFast) {
      return Response.json(
        { error: "BOT_CHECK", message: "Please take a moment to fill the form, then try again.", statusCode: 400 },
        { status: 400 }
      );
    }
    fields.forEach((f) => delete raw[f]);
    return Buffer.from(JSON.stringify(raw));
  } catch {
    return Response.json({ error: "BOT_CHECK", message: "Please try again.", statusCode: 400 }, { status: 400 });
  }
}

/* ---------- per-surface handlers ---------- */

export async function relayAuth(req: Request, parts: string[]) {
  const path = parts.join("/");
  const hit = ALLOWED_AUTH.some(
    ([m, p]) => req.method === m && (path === p || path.startsWith(p + "/"))
  );
  if (!hit) return deny(`Auth endpoint not allowed: ${req.method} ${path}`);
  const url = new URL(req.url);
  const upstream = upstreamUrl(["auth", ...parts], url.search);
  if (req.method === "POST" && path === "users") {
    // signup: bots must not create accounts (trolls/botnets). Honeypot + fill-time.
    const gated = await humanGate(req);
    if (gated instanceof Response) return gated;
    return relay(req, upstream, extractUserJwt(req), gated, { forwardCookie: true });
  }
  return relay(req, upstream, extractUserJwt(req), undefined, { forwardCookie: true });
}

/**
 * Forced filters for ANONYMOUS reads. The service credential bypasses RLS,
 * so without these a visitor could read drafts (is_active=false products),
 * unapproved reviews, or internal settings. PostgREST applies repeated
 * params as AND, so a client can't escape the forced term by adding its own.
 */
const ANON_FORCED_FILTERS: Record<string, [string, string][]> = {
  products: [["is_active", "eq.true"]],
  categories: [["is_active", "eq.true"]],
  promos: [["is_active", "eq.true"]],
  reviews: [["is_approved", "eq.true"]],
  site_settings: [["key", "in.(payments,shop)"]],
};

export function relayDatabase(req: Request, parts: string[]) {
  // only /api/database/records/<table> is exposed; advance/rawsql etc. are not
  if (parts[0] !== "records" || !parts[1] || parts.length !== 2) {
    return deny("Only /api/database/records/<table> is exposed to browsers");
  }
  const table = parts[1];
  const jwt = extractUserJwt(req);
  const url = new URL(req.url);

  if (jwt) {
    // logged-in: RLS + guards decide
    return relay(req, upstreamUrl(["database", ...parts], url.search), jwt);
  }
  if (req.method === "GET" && PUBLIC_READ_TABLES.has(table)) {
    // anonymous catalog read: service credential + hard filters (see above)
    for (const [k, v] of ANON_FORCED_FILTERS[table] ?? []) {
      url.searchParams.append(k, v);
    }
    return relay(
      req,
      upstreamUrl(["database", ...parts], url.search),
      `Bearer ${INSFORGE_API_KEY}`
    );
  }
  return deny("Login required for this data", 401);
}

export function relayStorage(req: Request, parts: string[]) {
  const jwt = extractUserJwt(req);
  const url = new URL(req.url);
  const upstream = upstreamUrl(["storage", ...parts], url.search);
  const bucketIdx = parts.indexOf("buckets");
  const bucket = bucketIdx >= 0 ? parts[bucketIdx + 1] : undefined;

  // anonymous: only GETs of objects in public buckets
  if (!jwt) {
    if (req.method === "GET" && bucket && PUBLIC_BUCKETS.has(bucket)) {
      return relay(req, upstream, `Bearer ${INSFORGE_API_KEY}`);
    }
    return deny("Login required for this storage operation", 401);
  }

  // signed-in: WRITES to shop-owned buckets (products/content) are admin-only —
  // a customer must never presign/upload/delete the public catalog buckets.
  // payment-proofs uploads stay open (the customer proof flow): fraud can't
  // touch catalog assets, and proofs are admin-reviewed anyway.
  if (req.method !== "GET" && bucket && bucket !== "payment-proofs") {
    return (async () => {
      const me = await fetch(`${INSFORGE_URL}/api/auth/sessions/current`, {
        headers: { apikey: INSFORGE_API_KEY, authorization: jwt }, cache: "no-store",
      });
      if (!me.ok) return deny("Invalid session", 401);
      const meJ = await me.json().catch(() => null);
      const uid: string | undefined = meJ?.user?.id;
      if (!uid) return deny("Invalid session", 401);
      const prof = await fetch(
        `${INSFORGE_URL}/api/database/records/profiles?id=eq.${encodeURIComponent(uid)}&select=role`,
        { headers: { apikey: INSFORGE_API_KEY, authorization: jwt }, cache: "no-store" }
      );
      if (!prof.ok) return deny("Cannot verify permissions", 403);
      const rows = await prof.json().catch(() => []);
      const role = Array.isArray(rows) && rows[0] ? (rows[0] as { role?: string }).role : undefined;
      if (role !== "admin") return deny("Owner account required for this storage operation", 403);
      return relay(req, upstream, jwt);
    })();
  }
  return relay(req, upstream, jwt);
}
