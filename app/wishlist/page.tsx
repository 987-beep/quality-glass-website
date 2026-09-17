import type { Metadata } from "next";
import { getAllProductImages, getProducts } from "@/lib/server/catalog";
import WishlistClient from "@/components/shop/wishlist-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wishlist — Quality Glass Emporium",
  robots: { index: false },
};

export default async function WishlistPage() {
  const [products, images] = await Promise.all([getProducts(), getAllProductImages()]);
  return <WishlistClient products={products} images={images} />;
}
