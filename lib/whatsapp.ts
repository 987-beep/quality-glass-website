/** WhatsApp helpers for the Owner Studio — one-tap customer messaging. */

import { SHOP } from "@/lib/site-config";

/** Normalize any Indian phone-ish string to wa.me digits ("8303108051" → "918303108051"). */
export function waNumber(raw?: string | null): string | null {
  if (!raw) return null;
  const d = String(raw).replace(/\D/g, "");
  if (d.length === 10) return "91" + d;
  if (d.length === 12 && d.startsWith("91")) return d;
  if (d.length === 11 && d.startsWith("0")) return "91" + d.slice(1);
  if (d.length > 10 && d.length <= 15 && !d.startsWith("0")) return d;
  return null;
}

/** wa.me click-to-chat link with a pre-filled message, or null if no usable phone. */
export function waLink(phone: string | null | undefined, text: string): string | null {
  const n = waNumber(phone);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

const money = (n: number | string) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const ADDR = "near Hotel Ganesh, PNT Colony, Raebareli";
const SIGN = "— Quality Glass Emporium";
const SITE = "https://quality-glass-website.vercel.app";

/** listing #1: self-serve tracking link customers can tap anytime ("कब तैयार है?") */
const trackLine = (orderNo: string) => `\n\n🔎 Track anytime: ${SITE}/track?o=${orderNo} (enter your phone number)`;

/**
 * Per-status customer message for an order. Warm, short, WhatsApp-ready.
 */
export function orderStatusMessage(o: {
  order_no: string;
  status: string;
  total_amount: number | string;
  delivery_method?: string;
}): string {
  const amt = money(o.total_amount);
  switch (o.status) {
    case "payment_pending":
      return `Namaste! 🙏 Your order ${o.order_no} (${amt}) is waiting for payment. Pay via the UPI QR on the checkout page and upload the screenshot — we'll start right away. ${SIGN}`;
    case "payment_verifying":
      return `Namaste! 🙏 We received your payment screenshot for order ${o.order_no} (${amt}). We're verifying it now and will confirm shortly. ${SIGN}${trackLine(o.order_no)}`;
    case "paid":
      return `Namaste! ✅ Payment confirmed for order ${o.order_no} (${amt}). Work has started on your order — we'll update you at every step. ${SIGN}${trackLine(o.order_no)}`;
    case "in_production":
      return `Your order ${o.order_no} is in production right now 🔨 — it's coming out beautifully. We'll message you the moment it's ready. ${SIGN}${trackLine(o.order_no)}`;
    case "ready_for_pickup":
      return `Great news! 🎉 Your order ${o.order_no} is READY for pickup at Quality Glass Emporium & Photo Framing Center, ${ADDR}. ${SHOP.hours}. Please show this message at the counter. ${SIGN}${trackLine(o.order_no)}`;
    case "out_for_delivery":
      return `Your order ${o.order_no} (${amt}) is out for delivery 🛵 — it will reach you shortly. Please keep your phone nearby. ${SIGN}${trackLine(o.order_no)}`;
    case "completed":
      return `Thank you for choosing Quality Glass Emporium! ✨ We hope you love your frame. A quick review helps our small shop a lot: ${SHOP.justdial} 🙏`;
    case "payment_rejected":
      return `Namaste, we couldn't verify the payment for order ${o.order_no} (${amt}) — the screenshot may be unclear or the amount didn't match. Please sign in → My Account → upload a fresh screenshot, and we'll confirm it quickly. ${SIGN}`;
    case "cancelled":
      return `Your order ${o.order_no} has been cancelled. If this was a mistake, just message us or place a fresh order anytime — we're happy to help. ${SIGN}${trackLine(o.order_no)}`;
    default:
      return `Namaste! 🙏 An update on your order ${o.order_no} (${amt}): it is now "${o.status}". ${SIGN}${trackLine(o.order_no)}`;
  }
}

/** Friendly opener for messaging a customer from the account manager. */
export function customerHelloMessage(name?: string | null): string {
  const who = (name || "").trim().split(" ")[0];
  return `Namaste${who ? ` ${who}` : ""}! 🙏 Quality Glass Emporium & Photo Framing Center (Raebareli) here. How can we help you today?`;
}
