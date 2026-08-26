/** Shared types + helpers for the Owner Studio admin panel. */

export type Json = Record<string, unknown> | null;

export type BiName = { en?: string; hi?: string } & Record<string, string | undefined>;

export type Order = {
  id: string;
  order_no: string;
  user_id: string;
  status: string;
  total_amount: number | string;
  currency: string;
  delivery_method: string;
  delivery_address: { name?: string; phone?: string; line?: string; note?: string } | null;
  customer_note: string | null;
  admin_note: string | null;
  coupon_code?: string | null;
  discount_amount?: number | string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: BiName | string | null;
  options: Record<string, string> | null;
  qty: number;
  unit_price: number | string;
  custom_upload_url: string | null;
  line_total: number | string;
};

export type PaymentProof = {
  id: string;
  order_id: string;
  user_id: string;
  storage_key: string;
  file_url: string | null;
  utr: string | null;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  username: string | null;
  avatar_url: string | null;
};

export type Category = { id: string; slug: string; name: BiName };

export type Product = {
  id: string;
  category_id: string;
  slug: string;
  name: BiName;
  description: BiName;
  base_price: number | string;
  frame_tone: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  storage_key: string | null;
  alt: string | null;
  sort: number;
};

export type Promo = {
  id: string;
  title: BiName;
  image_url: string;
  link: string | null;
  position: string;
  sort: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type Review = {
  id: string;
  user_id: string | null;
  author_name: string;
  area: string | null;
  rating: number;
  quote: BiName | string;
  is_approved: boolean;
  created_at: string;
  photo_url?: string | null;
  photo_key?: string | null;
  order_no?: string | null;
};

/* ---------- status helpers ---------- */

export const ORDER_STATUS: Record<string, { en: string; hi: string; tone: string }> = {
  payment_pending: { en: "Awaiting payment", hi: "भुगतान बाकी", tone: "text-ivory/60 border-ivory/25 bg-white/[0.04]" },
  payment_verifying: { en: "Verify payment!", hi: "भुगतान जाँचें", tone: "text-gold border-gold/50 bg-gold/10" },
  payment_rejected: { en: "Payment rejected", hi: "भुगतान अस्वीकृत", tone: "text-red-300 border-red-400/40 bg-red-500/10" },
  paid: { en: "Paid", hi: "भुगतान पक्का", tone: "text-leaf border-leaf/40 bg-leaf/10" },
  in_production: { en: "In production", hi: "बन रहा है", tone: "text-gold-light border-gold/35 bg-gold/[0.07]" },
  ready_for_pickup: { en: "Ready for pickup", hi: "पिकअप तैयार", tone: "text-leaf border-leaf/35 bg-leaf/[0.08]" },
  out_for_delivery: { en: "Out for delivery", hi: "डिलीवरी पर निकला", tone: "text-leaf border-leaf/35 bg-leaf/[0.08]" },
  completed: { en: "Completed", hi: "पूरा हुआ", tone: "text-ivory/70 border-ivory/20 bg-white/[0.03]" },
  cancelled: { en: "Cancelled", hi: "रद्द", tone: "text-red-300/80 border-red-400/25 bg-red-500/[0.06]" },
};

/** What the owner may advance each status to (DB check constraint allows only these) */
export const NEXT_ACTIONS: Record<string, { to: string; label: string; strong?: boolean }[]> = {
  payment_pending: [{ to: "cancelled", label: "Cancel order" }],
  payment_verifying: [
    { to: "paid", label: "Approve payment ✓", strong: true },
    { to: "payment_rejected", label: "Reject payment" },
    { to: "cancelled", label: "Cancel order" },
  ],
  payment_rejected: [
    { to: "paid", label: "Approve anyway ✓" },
    { to: "cancelled", label: "Cancel order" },
  ],
  paid: [
    { to: "in_production", label: "Start production →", strong: true },
    { to: "cancelled", label: "Cancel order" },
  ],
  in_production: [
    { to: "ready_for_pickup", label: "Ready for pickup", strong: true },
    { to: "out_for_delivery", label: "Out for delivery", strong: true },
    { to: "cancelled", label: "Cancel order" },
  ],
  ready_for_pickup: [{ to: "completed", label: "Mark completed ✓", strong: true }],
  out_for_delivery: [{ to: "completed", label: "Mark delivered ✓", strong: true }],
  completed: [],
  cancelled: [],
};

export const inr = (n: number | string) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const dt = (s: string) =>
  new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const biText = (v: BiName | string | null | undefined): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.en || v.hi || Object.values(v).find(Boolean) || "";
};

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export const FRAME_TONES = ["black", "gold", "wood"];

/** Where browser-side uploads land (public route through this site's own proxy) */
export const publicStorageUrl = (bucket: string, key: string) =>
  `/api/storage/buckets/${bucket}/objects/${key}`;
