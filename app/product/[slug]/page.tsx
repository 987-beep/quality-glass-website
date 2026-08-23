import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProductImages,
  getFrameOptions,
  getProductBySlug,
  getProducts,
} from "@/lib/server/catalog";
import ProductDetail from "@/components/shop/product-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found — Quality Glass Emporium" };
  return {
    title: `${p.name.en ?? p.slug} — Quality Glass Emporium`,
    description: p.description?.en ?? undefined,
  };
}

export default async function ProductPage(props: Props) {
  const { slug } = await props.params;
  const [product, allProducts, allImages, options] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getAllProductImages(),
    getFrameOptions(),
  ]);
  if (!product) notFound();

  const related = allProducts
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);
  const backfill = allProducts.filter(
    (p) => p.id !== product.id && p.category_id !== product.category_id
  );
  const relatedFinal = [...related, ...backfill].slice(0, 4);

  const relatedImages: Record<string, (typeof allImages)[number][]> = {};
  for (const r of relatedFinal) {
    relatedImages[r.slug] = allImages.filter((i) => i.product_id === r.id);
  }

  return (
    <ProductDetail
      product={product}
      images={allImages.filter((i) => i.product_id === product.id)}
      options={options}
      related={relatedFinal}
      relatedImages={relatedImages}
    />
  );
}
