import type { MetadataRoute } from "next";

const BASE = "https://quality-glass-website.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/track`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/bulk`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/studio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/gallery`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/photo-framing-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/custom-frames-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/glass-mirror-work-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/wedding-album-framing-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/certificate-framing-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/god-frame-mandir-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/photo-gift-frames-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/anime-poster-framing-raebareli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/office-bulk-frames-raebareli`, changeFrequency: "monthly", priority: 0.8 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.INSFORGE_URL}/api/database/records/products?is_active=eq.true&select=slug,created_at`,
      {
        headers: {
          apikey: process.env.INSFORGE_API_KEY ?? "",
          authorization: `Bearer ${process.env.INSFORGE_API_KEY ?? ""}`,
        },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const rows: { slug: string; created_at: string }[] = await res.json();
      productRoutes = (Array.isArray(rows) ? rows : []).map((p) => ({
        url: `${BASE}/product/${p.slug}`,
        lastModified: p.created_at,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch {
    /* products are a bonus — never break the sitemap */
  }

  return [...staticRoutes, ...productRoutes];
}
