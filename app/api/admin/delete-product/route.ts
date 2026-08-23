/**
 * Server-side product deletion for the Owner Studio.
 *
 * One atomic call from the browser: verifies the caller is the shop owner
 * (session JWT → InsForge → profile role = admin), then performs the delete
 * with that same user JWT, so RLS + write-guard triggers apply normally.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";

async function insforge(path: string, init: RequestInit, jwt?: string) {
  const headers: Record<string, string> = {
    apikey: INSFORGE_API_KEY,
    authorization: `Bearer ${jwt ?? INSFORGE_API_KEY}`,
    "content-type": "application/json",
  };
  return fetch(`${INSFORGE_URL}/api/${path}`, { ...init, headers, cache: "no-store" });
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    if (!/^Bearer\s+eyJ/i.test(auth)) {
      return Response.json({ ok: false, error: "Sign in as the shop owner first." }, { status: 401 });
    }
    const jwt = auth.replace(/^Bearer\s+/i, "");
    const { id } = await req.json().catch(() => ({ id: null as string | null }));
    if (!id || typeof id !== "string") {
      return Response.json({ ok: false, error: "Missing product id." }, { status: 400 });
    }

    // 1. who is calling?
    const meRes = await insforge("auth/sessions/current", { method: "GET" }, jwt);
    if (!meRes.ok) {
      return Response.json({ ok: false, error: "Session expired — sign in again." }, { status: 401 });
    }
    const me = await meRes.json();
    const uid: string | undefined = me?.user?.id ?? me?.id;
    if (!uid) return Response.json({ ok: false, error: "Could not identify your account." }, { status: 401 });

    // 2. admin?
    const profRes = await insforge(`database/records/profiles?id=eq.${uid}&select=id,role`, { method: "GET" }, jwt);
    if (profRes.ok) {
      const rows = await profRes.json().catch(() => []);
      const role = Array.isArray(rows) && rows[0] ? (rows[0] as { role?: string }).role : undefined;
      if (role !== "admin") {
        return Response.json({ ok: false, error: "Owner account required for this." }, { status: 403 });
      }
    }

    // 3. delete images, then the product (with the caller's JWT so guards/RLS hold)
    const imgDel = await insforge(`database/records/product_images?product_id=eq.${id}`, { method: "DELETE" }, jwt);
    if (!imgDel.ok && imgDel.status !== 404) {
      const t = await imgDel.text();
      return Response.json({ ok: false, error: `Could not clear photos: ${t.slice(0, 180)}` }, { status: 502 });
    }
    const prodDel = await insforge(`database/records/products?id=eq.${id}`, { method: "DELETE" }, jwt);
    if (!prodDel.ok) {
      const t = await prodDel.text();
      return Response.json({ ok: false, error: `Product not deleted: ${t.slice(0, 180)}` }, { status: 502 });
    }

    // 4. confirm it's really gone
    const chk = await insforge(`database/records/products?id=eq.${id}&select=id`, { method: "GET" }, jwt);
    const remaining = chk.ok ? await chk.json().catch(() => []) : [];
    if (Array.isArray(remaining) && remaining.length > 0) {
      return Response.json({ ok: false, error: "Delete was refused by the database (product remains)." }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Unexpected error." }, { status: 500 });
  }
}
