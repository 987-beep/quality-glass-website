/**
 * Server-only catalog fetchers — call InsForge directly with the master key.
 * Used by Server Components for SEO-friendly SSR of the shop.
 */

const INSFORGE_URL = process.env.INSFORGE_URL ?? "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY ?? "";

export type Localized = { en?: string; hi?: string };

export type Category = {
  id: string;
  slug: string;
  name: Localized;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  base_price: string | number;
  category_id: string | null;
  frame_tone: string | null;
  is_featured: boolean;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string | null;
  storage_key: string | null;
  alt: string | null;
  sort: number;
};

export type FrameOption = {
  id: string;
  key: string;
  kind: "size" | "glass" | "moulding" | "mat" | string;
  name: Localized;
  price_delta: string | number;
  sort: number;
  is_active: boolean;
};

async function dbGet<T>(table: string, query = ""): Promise<T[]> {
  try {
    const res = await fetch(`${INSFORGE_URL}/api/database/records/${table}${query}`, {
      headers: {
        apikey: INSFORGE_API_KEY,
        authorization: `Bearer ${INSFORGE_API_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

export type ApprovedReview = {
  id: string;
  author_name: string;
  area: string | null;
  rating: number;
  quote: Localized;
  photo_url: string | null;
};

export const getApprovedReviews = () =>
  dbGet<ApprovedReview>(
    "reviews",
    "?is_approved=eq.true&select=id,author_name,area,rating,quote,photo_url&order=created_at.desc&limit=12"
  );

export const getCategories = () =>
  dbGet<Category>("categories", "?select=id,slug,name");

export const getProducts = () =>
  dbGet<Product>(
    "products",
    "?is_active=eq.true&select=id,slug,name,description,base_price,category_id,frame_tone,is_featured"
  );

export const getProductBySlug = async (slug: string) =>
  (await dbGet<Product>("products", `?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true`))[0] ??
  null;

export const getProductImages = async (productId: string) =>
  (
    await dbGet<ProductImage>(
      "product_images",
      `?product_id=eq.${encodeURIComponent(productId)}&order=sort.asc`
    )
  ) ?? [];

export const getAllProductImages = () =>
  dbGet<ProductImage>("product_images", "?order=sort.asc");

export const getFrameOptions = () =>
  dbGet<FrameOption>("frame_options", "?is_active=eq.true&order=sort.asc");

export const priceOf = (p: Product) =>
  typeof p.base_price === "string" ? Number(p.base_price) : p.base_price;
