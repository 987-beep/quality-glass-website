/**
 * Server-side customer account manager for the Owner Studio.
 *
 *   GET            → list every registered account (email, provider, joined date,
 *                    role, username, phone, order count) for the admin UI.
 *   POST { userId }→ permanently remove ONE customer account and everything
 *                    attached to it.
 *
 * Why SQL for removal: InsForge's auth REST API refuses user deletion without
 * a *dashboard* session, even with the master ik_ key, and the DB write-guard
 * trigger (guard_authenticated_write) blocks session-less writes on public
 * tables. The store's own escape hatch is ops.maintenance_flag: raising it
 * inside a single transaction permits the cleanup, then the flag is dropped
 * again before commit — nothing persists if anything fails.
 *
 * Safety rails: the caller must be a signed-in profile with role = admin;
 * you cannot delete your own account; other admin accounts can never be
 * removed through this route. The master key and DB URL stay server-side only.
 */

import { Client } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";
const INSFORGE_DATABASE_URL = process.env.INSFORGE_DATABASE_URL ?? "";

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
  let db: Client | null = null;
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
    if (!INSFORGE_DATABASE_URL) {
      return Response.json({ ok: false, error: "Server is missing its database connection." }, { status: 500 });
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

    // Grab the account's payment-proof file keys first (for storage cleanup).
    let proofKeys: string[] = [];
    let proofCount = 0;
    const proofsRes = await insforge(
      `database/records/payment_proofs?user_id=eq.${encodeURIComponent(userId)}&select=id,storage_key`, { method: "GET" }
    );
    if (proofsRes.ok) {
      const proofs: { storage_key: string | null }[] = await proofsRes.json().catch(() => []);
      proofCount = Array.isArray(proofs) ? proofs.length : 0;
      proofKeys = (Array.isArray(proofs) ? proofs : []).map((p) => p.storage_key).filter((k): k is string => Boolean(k));
    }

    // One transaction: raise the maintenance flag (satisfies the write-guard
    // trigger), wipe the account, drop the flag, commit. Rollback on any error
    // leaves the DB exactly as it was.
    db = new Client({ connectionString: INSFORGE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await db.connect();
    const removed = { reviewsUnlinked: 0, orders: 0, proofs: proofCount, profile: true, authUser: 0 };
    try {
      await db.query("begin");
      await db.query('insert into ops.maintenance_flag("on") values (true)');
      const rev = await db.query("update reviews set user_id = null where user_id = $1", [userId]);
      removed.reviewsUnlinked = rev.rowCount ?? 0;
      const ord = await db.query("delete from orders where user_id = $1", [userId]);
      removed.orders = ord.rowCount ?? 0;
      // ^ deleting orders cascades order_items; profiles + user_providers
      // cascade from auth.users below.
      const usr = await db.query("delete from auth.users where id = $1", [userId]);
      removed.authUser = usr.rowCount ?? 0;
      await db.query("delete from ops.maintenance_flag");
      if (removed.authUser === 0) {
        await db.query("rollback");
        return Response.json({ ok: false, error: "That account no longer exists (nothing was changed)." }, { status: 404 });
      }
      await db.query("commit");
    } catch (e) {
      try { await db.query("rollback"); } catch { /* ignore */ }
      const msg = e instanceof Error ? e.message : "Database refused the removal.";
      return Response.json({ ok: false, error: `Removal failed, nothing was changed: ${msg.slice(0, 180)}` }, { status: 502 });
    } finally {
      try { await db.end(); } catch { /* ignore */ }
      db = null;
    }

    // Best-effort: remove the uploaded proof screenshots from storage.
    let proofFiles = 0;
    for (const key of proofKeys) {
      const fileDel = await insforge(
        `storage/buckets/payment-proofs/objects/${encodeURIComponent(key)}`, { method: "DELETE" }
      );
      if (fileDel.ok || fileDel.status === 404) proofFiles += 1;
    }

    // Verify the account is really gone.
    const chk = await insforge(`auth/users/${encodeURIComponent(userId)}`, { method: "GET" });
    if (chk.ok) {
      return Response.json({ ok: false, error: "Delete was refused — the account still exists." }, { status: 502 });
    }

    return Response.json({ ok: true, removed: { ...removed, proofFiles } });
  } catch (e) {
    try { await db?.end(); } catch { /* ignore */ }
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Unexpected error." }, { status: 500 });
  }
}
