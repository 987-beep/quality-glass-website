/**
 * Server-side customer account manager for the Owner Studio.
 *
 *   GET            → list every registered account (email, provider, joined date,
 *                    role, username, phone, order count) for the admin UI.
 *   POST { userId }→ permanently remove ONE customer account and everything
 *                    attached to it: payment-proof rows + screenshot files,
 *                    order items, orders, review links, profile row, and
 *                    finally the InsForge auth user itself.
 *
 * Safety rails: the caller must be a signed-in profile with role = admin;
 * you cannot delete your own account; other admin accounts can never be
 * removed through this route. The master ik_ key stays server-side only.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";

function insforge(path: string, init: RequestInit, jwt?: string) {
  const headers: Record<string, string> = {
    apikey: INSFORGE_API_KEY,
    authorization: `Bearer ${jwt ?? INSFORGE_API_KEY}`,
    "content-type": "application/json",
  };
  return fetch(`${INSFORGE_URL}/api/${path}`, { ...init, headers, cache: "no-store" });
}

type AdminAuth = { uid: string; jwt: string } | { error: Response };

/** Verify the caller is the signed-in shop owner (profile role = admin). */
async function requireAdmin(req: Request): Promise<AdminAuth> {
  const auth = req.headers.get("authorization") ?? "";
  if (!/^Bearer\s+eyJ/i.test(auth)) {
    return { error: Response.json({ ok: false, error: "Sign in as the shop owner first." }, { status: 401 }) };
  }
  const jwt = auth.replace(/^Bearer\s+/i, "");

  const meRes = await insforge("auth/sessions/current", { method: "GET" }, jwt);
  if (!meRes.ok) {
    return { error: Response.json({ ok: false, error: "Session expired — sign in again." }, { status: 401 }) };
  }
  const me = await meRes.json().catch(() => null);
  const uid: string | undefined = me?.user?.id ?? me?.id;
  if (!uid) {
    return { error: Response.json({ ok: false, error: "Could not identify your account." }, { status: 401 }) };
  }

  const profRes = await insforge(`database/records/profiles?id=eq.${encodeURIComponent(uid)}&select=id,role`, { method: "GET" }, jwt);
  if (profRes.ok) {
    const rows = await profRes.json().catch(() => []);
    const role = Array.isArray(rows) && rows[0] ? (rows[0] as { role?: string }).role : undefined;
    if (role !== "admin") {
      return { error: Response.json({ ok: false, error: "Owner account required for this." }, { status: 403 }) };
    }
  }
  return { uid, jwt };
}

/* ------------------------------------------------------------------ GET: list */

type IfUser = {
  id: string;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
  providers?: string[];
  profile?: { name?: string; avatar_url?: string } | null;
};

export async function GET(req: Request) {
  try {
    const gate = await requireAdmin(req);
    if ("error" in gate) return gate.error;

    const usersRes = await insforge("auth/users?offset=0&limit=500", { method: "GET" });
    if (!usersRes.ok) {
      const t = await usersRes.text();
      return Response.json({ ok: false, error: `Could not list accounts: ${t.slice(0, 160)}` }, { status: 502 });
    }
    const usersBody = await usersRes.json().catch(() => ({}));
    const users: IfUser[] = Array.isArray(usersBody?.data) ? usersBody.data : Array.isArray(usersBody) ? usersBody : [];

    const [profRes, ordRes] = await Promise.all([
      insforge("database/records/profiles?select=id,role,username,phone,full_name", { method: "GET" }),
      insforge("database/records/orders?select=id,user_id,status,total_amount,created_at", { method: "GET" }),
    ]);
    const profiles = profRes.ok ? await profRes.json().catch(() => []) : [];
    const orders = ordRes.ok ? await ordRes.json().catch(() => []) : [];
    type ProfileLite = { id: string; role?: string; username?: string; phone?: string; full_name?: string };
    const profMap = new Map<string, ProfileLite>(
      (Array.isArray(profiles) ? (profiles as ProfileLite[]) : []).map((p) => [p.id, p])
    );
    const orderStats = new Map<string, { count: number; last: string }>();
    (Array.isArray(orders) ? orders : []).forEach((o: { user_id: string; created_at: string }) => {
      const cur = orderStats.get(o.user_id) ?? { count: 0, last: "" };
      cur.count += 1;
      if (o.created_at > cur.last) cur.last = o.created_at;
      orderStats.set(o.user_id, cur);
    });

    const out = users.map((u) => ({
      id: u.id,
      email: u.email,
      emailVerified: Boolean(u.emailVerified),
      providers: u.providers ?? [],
      name: u.profile?.name || profMap.get(u.id)?.full_name || "",
      avatar: u.profile?.avatar_url || "",
      role: profMap.get(u.id)?.role ?? "customer",
      username: profMap.get(u.id)?.username ?? null,
      phone: profMap.get(u.id)?.phone ?? null,
      joined: u.createdAt ?? "",
      orderCount: orderStats.get(u.id)?.count ?? 0,
      lastOrderAt: orderStats.get(u.id)?.last || null,
      isSelf: u.id === gate.uid,
    }));

    return Response.json({ ok: true, users: out });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Unexpected error." }, { status: 500 });
  }
}

/* ------------------------------------------------------- POST: remove account */

export async function POST(req: Request) {
  try {
    const gate = await requireAdmin(req);
    if ("error" in gate) return gate.error;

    const body = await req.json().catch(() => ({}));
    const userId: string | null = typeof body?.userId === "string" ? body.userId : null;
    if (!userId) {
      return Response.json({ ok: false, error: "Missing userId." }, { status: 400 });
    }
    if (!/^[0-9a-f-]{20,}$/i.test(userId)) {
      return Response.json({ ok: false, error: "That doesn't look like an account id." }, { status: 400 });
    }
    if (userId === gate.uid) {
      return Response.json({ ok: false, error: "You can't delete your own owner account here." }, { status: 400 });
    }

    // Never allow deleting another admin account.
    const targetProfRes = await insforge(
      `database/records/profiles?id=eq.${encodeURIComponent(userId)}&select=id,role`, { method: "GET" }
    );
    if (targetProfRes.ok) {
      const rows = await targetProfRes.json().catch(() => []);
      const role = Array.isArray(rows) && rows[0] ? (rows[0] as { role?: string }).role : undefined;
      if (role === "admin") {
        return Response.json({ ok: false, error: "Admin accounts can't be removed from here." }, { status: 403 });
      }
    }

    const removed = { proofs: 0, proofFiles: 0, orders: 0, orderItems: true, reviewsUnlinked: true, profile: true, authUser: false };
    const warns: string[] = [];

    // 1. Payment proofs (DB rows) + their screenshot files in storage
    const proofsRes = await insforge(
      `database/records/payment_proofs?user_id=eq.${encodeURIComponent(userId)}&select=id,storage_key`, { method: "GET" }
    );
    if (proofsRes.ok) {
      const proofs: { id: string; storage_key: string | null }[] = await proofsRes.json().catch(() => []);
      removed.proofs = Array.isArray(proofs) ? proofs.length : 0;
      if (removed.proofs > 0) {
        const del = await insforge(`database/records/payment_proofs?user_id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" });
        if (!del.ok) warns.push("proof-rows");
        for (const p of Array.isArray(proofs) ? proofs : []) {
          if (!p.storage_key) continue;
          const fileDel = await insforge(
            `storage/buckets/payment-proofs/objects/${encodeURIComponent(p.storage_key)}`, { method: "DELETE" }
          );
          if (fileDel.ok || fileDel.status === 404) removed.proofFiles += 1;
        }
      }
    } else {
      warns.push("proof-lookup");
    }

    // 2. Order items, then orders
    const ordRes = await insforge(
      `database/records/orders?user_id=eq.${encodeURIComponent(userId)}&select=id`, { method: "GET" }
    );
    const ordRows: { id: string }[] = ordRes.ok ? await ordRes.json().catch(() => []) : [];
    removed.orders = Array.isArray(ordRows) ? ordRows.length : 0;
    if (removed.orders > 0) {
      const inList = encodeURIComponent(`in.(${ordRows.map((o) => o.id).join(",")})`);
      const itemsDel = await insforge(`database/records/order_items?order_id=${inList}`, { method: "DELETE" });
      if (!itemsDel.ok) { removed.orderItems = false; warns.push("order-items"); }
      const ordDel = await insforge(`database/records/orders?user_id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" });
      if (!ordDel.ok) warns.push("orders");
    }

    // 3. Reviews: keep the text, detach it from the deleted account
    const revPatch = await insforge(
      `database/records/reviews?user_id=eq.${encodeURIComponent(userId)}`,
      { method: "PATCH", body: JSON.stringify({ user_id: null }) }
    );
    if (!revPatch.ok && revPatch.status !== 404) { removed.reviewsUnlinked = false; warns.push("reviews"); }

    // 4. Profile row
    const profDel = await insforge(`database/records/profiles?id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" });
    if (!profDel.ok && profDel.status !== 404) { removed.profile = false; warns.push("profile"); }

    // 5. The auth account itself
    const userDel = await insforge("auth/users", {
      method: "DELETE",
      body: JSON.stringify({ userIds: [userId] }),
    });
    if (!userDel.ok) {
      const t = await userDel.text();
      return Response.json(
        { ok: false, error: `Account removal refused (${userDel.status}): ${t.slice(0, 180)}`, partial: removed, warns },
        { status: 502 }
      );
    }

    // 6. Verify the account is really gone
    const chk = await insforge(`auth/users/${encodeURIComponent(userId)}`, { method: "GET" });
    if (chk.ok) {
      return Response.json(
        { ok: false, error: "Delete was refused — the account still exists.", partial: removed, warns },
        { status: 502 }
      );
    }
    removed.authUser = true;

    return Response.json({ ok: true, removed, warns });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Unexpected error." }, { status: 500 });
  }
}
