/**
 * Server-side PDF invoice for the Owner Studio.
 * Verifies the caller is an admin (session JWT → InsForge → profiles.role),
 * loads the order + items + customer, renders a clean PDF receipt with pdf-lib.
 *
 * GET /api/admin/invoice-pdf?id=<order uuid>   (Authorization: Bearer <user JWT>)
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

const money = (n: number | string) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`;

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    if (!/^Bearer\s+eyJ/i.test(auth)) {
      return Response.json({ ok: false, error: "Sign in as the shop owner first." }, { status: 401 });
    }
    const jwt = auth.replace(/^Bearer\s+/i, "");
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return Response.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const meRes = await insforge("auth/sessions/current", { method: "GET" }, jwt);
    if (!meRes.ok) return Response.json({ ok: false, error: "Session expired — sign in again." }, { status: 401 });
    const me = await meRes.json().catch(() => ({}));
    const uid: string | undefined = me?.user?.id ?? me?.id;
    if (!uid) return Response.json({ ok: false, error: "Could not identify your account." }, { status: 401 });

    const profRes = await insforge(`database/records/profiles?id=eq.${uid}&select=id,role`, { method: "GET" }, jwt);
    const prof = await profRes.json().catch(() => []);
    if (!Array.isArray(prof) || prof[0]?.role !== "admin") {
      return Response.json({ ok: false, error: "Only the shop owner can download invoices." }, { status: 403 });
    }

    // fetch order + items (via the admin's own JWT — RLS allows)
    const [orderRes, itemsRes] = await Promise.all([
      insforge(`database/records/orders?id=eq.${id}&select=*`, { method: "GET" }, jwt),
      insforge(`database/records/order_items?order_id=eq.${id}&select=*`, { method: "GET" }, jwt),
    ]);
    const orders = await orderRes.json().catch(() => []);
    const order = Array.isArray(orders) && orders[0] ? orders[0] : null;
    if (!order) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });
    const items = (await itemsRes.json().catch(() => [])) as any[];

    // ── PDF (pdf-lib) ──────────────────────────────────────────
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]); // A4
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const ink = rgb(0.05, 0.04, 0.02), gold = rgb(0.79, 0.64, 0.30), muter = rgb(0.45, 0.42, 0.36), lineC = rgb(0.85, 0.80, 0.70);
    const M = 56; let y = 790;

    const txt = (t: string, opt: { x?: number; y?: number; size?: number; font?: any; color?: any } = {}) =>
      page.drawText(String(t), { x: opt.x ?? M, y: opt.y ?? y, size: opt.size ?? 11, font: opt.font ?? regular, color: opt.color ?? ink });

    page.drawRectangle({ x: 0, y: 770, width: 595, height: 72, color: rgb(0.047, 0.039, 0.024) });
    txt("QUALITY GLASS EMPORIUM", { x: M, y: 810, size: 14, font: bold, color: gold });
    txt("Photo Framing Center — PNT Colony, near Hotel Ganesh, Raebareli (UP) 229001", { x: M, y: 792, size: 9, color: rgb(0.95,0.94,0.9) });

    y = 744;
    txt("TAX INVOICE / ORDER RECEIPT", { size: 16, font: bold });
    y -= 22;
    txt(`Order No:  ${order.order_no ?? id}`, { font: bold, size: 12, color: gold });
    txt(`Date:  ${new Date(order.created_at ?? Date.now()).toLocaleString("en-IN")}`, { x: 330, size: 10, color: muter });
    y -= 18;
    txt(`Status:  ${String(order.status ?? "").replaceAll("_", " ").toUpperCase()}`);
    txt(`Customer name:  ${order.customer_name ?? "—"}`, { x: 330 });
    y -= 16;
    txt(`Phone:  ${order.customer_phone ?? "—"}`); txt(`Delivery:  ${order.delivery_method ?? "—"}`, { x: 330 });
    y -= 16;
    if (order.address) { txt(`Address:  ${String(order.address).slice(0, 90)}`, { size: 9, color: muter }); y -= 16; }
    page.drawLine({ start: { x: M, y }, end: { x: 540, y }, thickness: 1, color: lineC });
    y -= 22;

    txt("ITEMS", { size: 11, font: bold, color: gold }); txt("QTY", { x: 370, size: 11, font: bold, color: gold }); txt("AMOUNT", { x: 430, size: 11, font: bold, color: gold });
    y -= 16;
    for (const it of items.length ? items : [{ product_name: "Order items", quantity: 1, unit_price: order.total_amount, total_price: order.total_amount }]) {
      const name = `${it.product_name ?? it.name ?? "Item"}${it.frame_size ? ` · ${it.frame_size}` : ""}${it.material ? ` · ${it.material}` : ""}`;
      txt(String(name).slice(0, 52), { size: 10 });
      txt(`${it.quantity ?? 1}`, { x: 376, size: 10 });
      txt(money(it.total_price ?? (Number(it.unit_price ?? 0) * (it.quantity ?? 1))), { x: 430, size: 10 });
      y -= 15;
    }
    y -= 8; page.drawLine({ start: { x: M, y }, end: { x: 540, y }, thickness: 1, color: lineC }); y -= 24;

    if (order.coupon_code) { txt(`Coupon: ${order.coupon_code} applied`, { size: 10, color: muter }); y -= 16; }
    txt(`Subtotal:  ${money(order.subtotal ?? order.total_amount)}`, { x: 370 });
    y -= 16;
    if (order.discount_amount) { txt(`Discount:  −${money(order.discount_amount)}`, { x: 370, color: gold }); y -= 16; }
    txt(`TOTAL:  ${money(order.total_amount)}`, { x: 370, size: 14, font: bold });

    y = 120;
    page.drawLine({ start: { x: M, y }, end: { x: 540, y }, thickness: 1, color: lineC });
    y -= 20;
    txt("Thank you for framing with us!", { size: 12, font: bold, color: gold });
    y -= 16;
    txt("Track this order anytime: quality-glass-website.vercel.app/track", { size: 9, color: muter });
    y -= 12;
    txt("Rate: 4.9 on Justdial · Since 2018 · quality-glass-website.vercel.app", { size: 9, color: muter });

    const pdf = await doc.save();
    const fname = `${order.order_no ?? "invoice"}.pdf`;
    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${fname}"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error." }, { status: 500 });
  }
}
