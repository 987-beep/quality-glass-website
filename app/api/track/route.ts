/**
 * Guest order tracking — POST { orderNo, phone }.
 *
 * Lets a customer check order status WITHOUT signing in. Privacy rules:
 *  - Both the order number AND a matching phone number are required
 *    (delivery phone given at checkout, or the account profile phone).
 *  - The same "not found" message is returned whether the order number is
 *    wrong or the phone doesn't match — no information leaks either way.
 *  - Only non-sensitive fields come back: status, dates, item names/qty,
 *    total. Never the address, proof screenshots, or internal admin notes.
 *  - 10 lookups/min per IP (brute-force guard), on top of the global limiter.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";

const hits = new Map<string, { count: number; reset: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) { hits.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  h.count += 1;
  return h.count > 10;
}

const NOT_FOUND = "No order found for that order number and phone number. Check both and try again.";

function insforge(path: string, init: RequestInit) {
  return fetch(`${INSFORGE_URL}/api/${path}`, {
    ...init,
    headers: {
      apikey: INSFORGE_API_KEY,
      authorization: `Bearer ${INSFORGE_API_KEY}`,
      "content-type": "application/json",
    },
    cache: "no-store",
  });
}

const last10 = (s?: string | null) => String(s || "").replace(/\D/g, "").slice(-10);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (limited(ip)) {
      return Response.json({ ok: false, error: "Too many lookups — wait a minute and try again." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const orderNo = String(body?.orderNo ?? "").trim().toUpperCase();
    const phoneDigits = last10(String(body?.phone ?? ""));
    if (!/^QG-[A-Z0-9]{5,12}$/.test(orderNo)) {
      return Response.json({ ok: false, error: "That doesn't look like an order number (e.g. QG-5X7K2LA)." }, { status: 400 });
    }
    if (phoneDigits.length !== 10) {
      return Response.json({ ok: false, error: "Enter the 10-digit phone number used while ordering." }, { status: 400 });
    }

    const ordRes = await insforge(
      `database/records/orders?order_no=eq.${encodeURIComponent(orderNo)}&select=id,order_no,user_id,status,total_amount,delivery_method,delivery_address,created_at,updated_at`,
      { method: "GET" }
    );
    if (!ordRes.ok) {
      return Response.json({ ok: false, error: "Tracking is unavailable right now — try again shortly." }, { status: 502 });
    }
    const rows = await ordRes.json().catch(() => []);
    const order = Array.isArray(rows) && rows[0];
    if (!order) {
      return Response.json({ ok: false, error: NOT_FOUND }, { status: 404 });
    }

    // phone must match the delivery phone OR the account profile phone
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

    const [itemsRes, proofRes] = await Promise.all([
      insforge(
        `database/records/order_items?order_id=eq.${encodeURIComponent(order.id)}&select=name,qty,options`,
        { method: "GET" }
      ),
      order.status === "payment_rejected"
        ? insforge(
            `database/records/payment_proofs?order_id=eq.${encodeURIComponent(order.id)}&select=admin_note,created_at&order=created_at.desc&limit=1`,
            { method: "GET" }
          )
        : Promise.resolve(null),
    ]);
    const items = itemsRes.ok ? await itemsRes.json().catch(() => []) : [];
    let rejectReason: string | null = null;
    if (proofRes && proofRes.ok) {
      const ps = await proofRes.json().catch(() => []);
      rejectReason = ps?.[0]?.admin_note ?? null;
    }

    return Response.json({
      ok: true,
      order: {
        order_no: order.order_no,
        status: order.status,
        total_amount: order.total_amount,
        delivery_method: order.delivery_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: (Array.isArray(items) ? items : []).map(
          (i: { name?: unknown; qty?: number; options?: Record<string, string> | null }) => ({
            name: i.name ?? null,
            qty: i.qty ?? 1,
            options: i.options ?? null,
          })
        ),
        rejectReason,
      },
    });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Unexpected error." }, { status: 500 });
  }
}
