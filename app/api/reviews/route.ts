/**
 * Guest photo-review submission — POST from the /track page for COMPLETED orders.
 *
 * Trust model:
 *  - Requires the same identity proof as tracking: order number + matching phone.
 *  - Only orders whose status is "completed" can be reviewed, and each order
 *    can be reviewed exactly once.
 *  - Bot shield: same honeypot + fill-time humanGate used on signup/tracking.
 *  - Photos were already uploaded by the client into the public `content`
 *    bucket; we only accept same-origin storage URLs, everything else is dropped.
 *  - New reviews land with is_approved=false — the owner publishes them from
 *    Admin → Reviews (or rejects by deleting). Inserts run in a maintenance-flag
 *    transaction because anonymous database writes are blocklisted.
 *  - 5 submissions/min per IP.
 */

import { Client } from "pg";
import { humanGate } from "@/lib/server/insforge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";
const INSFORGE_DATABASE_URL = process.env.INSFORGE_DATABASE_URL ?? "";

const hits = new Map<string, { count: number; reset: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) { hits.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  h.count += 1;
  return h.count > 5;
}

const last10 = (s?: string | null) => String(s || "").replace(/\D/g, "").slice(-10);
const NOT_FOUND = "No completed order found for that order number and phone number.";

function insforge(path: string, init: RequestInit) {
  return fetch(`${INSFORGE_URL}/api/${path}`, {
    ...init,
    headers: {
      apikey: INSFORGE_API_KEY,
      authorization: `Bearer ${INSFORGE_API_KEY}`,
      "content-type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (limited(ip)) {
      return Response.json({ ok: false, error: "Too many attempts — wait a minute and try again." }, { status: 429 });
    }

    const gated = await humanGate(req);
    let body: Record<string, unknown>;
    if (gated instanceof Response) {
      const t = await gated.text().catch(() => "");
      let msg = "Please take a moment and try again.";
      try { msg = JSON.parse(t).message || msg; } catch { /* keep default */ }
      return Response.json({ ok: false, error: msg }, { status: 400 });
    }
    body = JSON.parse(gated.toString("utf8") || "{}");

    const orderNo = String(body?.orderNo ?? "").trim().toUpperCase();
    const phoneDigits = last10(String(body?.phone ?? ""));
    const authorName = String(body?.authorName ?? "").trim().slice(0, 60);
    const area = String(body?.area ?? "").trim().slice(0, 60) || null;
    const rating = Math.round(Number(body?.rating));
    const quote = String(body?.quote ?? "").trim().slice(0, 800);
    let photoUrl = String(body?.photoUrl ?? "").trim() || null;
    let photoKey = String(body?.photoKey ?? "").trim() || null;
    if (photoUrl && !photoUrl.startsWith("/api/storage/buckets/")) { photoUrl = null; photoKey = null; }
    if (photoUrl) photoUrl = photoUrl.slice(0, 300);
    if (photoKey) photoKey = photoKey.slice(0, 200);

    if (!/^QG-[A-Z0-9]{5,12}$/.test(orderNo) || phoneDigits.length !== 10) {
      return Response.json({ ok: false, error: NOT_FOUND }, { status: 400 });
    }
    if (!authorName) {
      return Response.json({ ok: false, error: "Please tell us your name." }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json({ ok: false, error: "Pick a rating between 1 and 5 stars." }, { status: 400 });
    }
    if (quote.length < 5) {
      return Response.json({ ok: false, error: "A couple of words about your experience would help others." }, { status: 400 });
    }

    // order must exist, be completed, and the phone must match
    const ordRes = await insforge(
      `database/records/orders?order_no=eq.${encodeURIComponent(orderNo)}&select=id,order_no,user_id,status,delivery_address`,
      { method: "GET" }
    );
    if (!ordRes.ok) {
      return Response.json({ ok: false, error: "Reviews are unavailable right now — try again shortly." }, { status: 502 });
    }
    const rows = await ordRes.json().catch(() => []);
    const order = Array.isArray(rows) && rows[0];
    if (!order || order.status !== "completed") {
      return Response.json({ ok: false, error: NOT_FOUND }, { status: 404 });
    }
    let match = last10(order.delivery_address?.phone) === phoneDigits;
    if (!match) {
      const profRes = await insforge(
        `database/records/profiles?id=eq.${encodeURIComponent(order.user_id)}&select=phone`,
        { method: "GET" }
      );
      if (profRes.ok) {
        const profs = await profRes.json().catch(() => []);
        match = last10(profs?.[0]?.phone) === phoneDigits;
      }
    }
    if (!match) {
      return Response.json({ ok: false, error: NOT_FOUND }, { status: 404 });
    }

    // one review per order
    const dupRes = await insforge(
      `database/records/reviews?order_no=eq.${encodeURIComponent(orderNo)}&select=id&limit=1`,
      { method: "GET" }
    );
    if (dupRes.ok) {
      const dups = await dupRes.json().catch(() => []);
      if (Array.isArray(dups) && dups.length > 0) {
        return Response.json({ ok: false, error: "A review for this order has already been submitted. Thank you!" }, { status: 409 });
      }
    }

    if (!INSFORGE_DATABASE_URL) {
      return Response.json({ ok: false, error: "Server is missing its database connection." }, { status: 500 });
    }

    let db: Client | null = null;
    try {
      db = new Client({ connectionString: INSFORGE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await db.connect();
      await db.query("begin");
      await db.query('insert into ops.maintenance_flag("on") values (true)');
      await db.query(
        `insert into public.reviews (user_id, author_name, area, rating, quote, is_approved, photo_url, photo_key, order_no)
         values ($1,$2,$3,$4,$5::jsonb,false,$6,$7,$8)`,
        [order.user_id, authorName, area, rating, JSON.stringify({ en: quote }), photoUrl, photoKey, orderNo]
      );
      await db.query("delete from ops.maintenance_flag");
      await db.query("commit");
    } catch (e) {
      try { await db?.query("rollback"); } catch { /* ignore */ }
      return Response.json({ ok: false, error: "Couldn't save the review just now — please try again in a minute." }, { status: 502 });
    } finally {
      try { await db?.end(); } catch { /* ignore */ }
    }

    return Response.json({
      ok: true,
      message: "Thank you! Your review will appear on the website once the owner approves it.",
    });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong — please try again." }, { status: 500 });
  }
}
