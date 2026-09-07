import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton";

export default function ShopLoading() {
  return (
    <main className="relative min-h-[100svh] pb-28 pt-28 md:pt-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        {/* Header skeleton */}
        <div className="skeleton h-4 w-48 mb-4" />
        <div className="skeleton h-12 w-96 mb-5" />
        <div className="skeleton h-4 w-80 mb-3" />
        <div className="skeleton h-3 w-64 mb-8" />

        {/* Filter chips skeleton */}
        <div className="flex gap-3 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <ProductGridSkeleton count={8} />
      </div>
    </main>
  );
}
