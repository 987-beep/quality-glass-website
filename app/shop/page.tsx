import type { Metadata } from "next";
import {
  getAllProductImages,
  getCategories,
  getProducts,
} from "@/lib/server/catalog";
import ShopClient from "@/components/shop/shop-client";

export const metadata: Metadata = {
  title: "Shop — Quality Glass Emporium",
  description:
    "Ready-made photo frames, canvas wraps and gallery pieces, handcrafted in Raebareli. Order online, pay by UPI.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [categories, products, images, sp] = await Promise.all([
    getCategories(),
    getProducts(),
    getAllProductImages(),
    searchParams,
  ]);

  return (
    <ShopClient
      categories={categories}
      products={products}
      images={images}
      initialCategory={sp.category ?? "all"}
    />
  );
}
