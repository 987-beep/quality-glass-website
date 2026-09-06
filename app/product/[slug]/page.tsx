import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProductImages,
  getCategories,
  getFrameOptions,
  getProductBySlug,
  getProducts,
  getReviewStats,
  priceOf,
} from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";
import ProductDetail from "@/components/shop/product-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found — Quality Framing Emporium" };
  return {
    title: `${p.name.en ?? p.slug} — Quality Framing Emporium`,
    description: p.description?.en ?? undefined,
  };
}

export default async function ProductPage(props: Props) {
  const { slug } = await props.params;
  const [product, allProducts, allImages, options, cats, reviewStats] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getAllProductImages(),
    getFrameOptions(),
    getCategories(),
    getReviewStats(),
  ]);
  if (!product) notFound();

  // stickers are peel-and-stick: no framing, no customization picks
  const catSlug = cats.find((c) => c.id === product.category_id)?.slug ?? "";
  const frameless = catSlug === "stickers";

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

  const productImages = allImages.filter((i) => i.product_id === product.id);
  const primary = primaryImage(product.slug, productImages);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name?.en ?? product.slug,
    description: product.description?.en ?? undefined,
    image: [primary.src],
    brand: { "@type": "Brand", name: "Quality Framing Emporium" },
    offers: {
      "@type": "Offer",
      price: priceOf(product),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `https://quality-glass-website.vercel.app/product/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        product={product}
        images={productImages}
        options={frameless ? [] : options}
        related={relatedFinal}
        relatedImages={relatedImages}
        reviewStats={reviewStats}
      />
    </>
  );
}
