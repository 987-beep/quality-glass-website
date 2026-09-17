import Hero from "@/components/sections/hero";
import MarqueeStrip from "@/components/sections/marquee-strip";
import Categories from "@/components/sections/categories";
import HowItWorks from "@/components/sections/how-it-works";
import Featured from "@/components/sections/featured";
import DealOfDay from "@/components/sections/deal-of-day";
import WallSets from "@/components/sections/wall-sets";
import FrameAnything from "@/components/sections/frame-anything";
import SizeStrip from "@/components/sections/size-strip";
import Stats from "@/components/sections/stats";
import Testimonials from "@/components/sections/testimonials";
import Cta from "@/components/sections/cta";
import {
  getApprovedReviews,
  getFeaturedProducts,
  getAllProductImages,
  getDealProducts,
  getBundles,
} from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";

export default async function Home() {
  const [reviews, featured, allImages, deals, bundles] = await Promise.all([
    getApprovedReviews(),
    getFeaturedProducts(8),
    getAllProductImages(),
    getDealProducts(),
    getBundles(),
  ]);
  // featured product images for the hero background wall (slide show)
  const heroImages = featured.map((p) =>
    primaryImage(p.slug, allImages.filter((i) => i.product_id === p.id))
  );
  return (
    <main id="top" className="relative">
      <Hero wallImages={heroImages} />
      <MarqueeStrip />
      {/* Featured section moved between hero and collections */}
      <Featured products={featured} images={allImages} />
      <DealOfDay deals={deals} images={allImages} />
      <Categories />
      <WallSets bundles={bundles} images={allImages} />
      <FrameAnything />
      <SizeStrip />
      <HowItWorks />
      <Stats />
      <Testimonials approved={reviews} />
      <Cta />
    </main>
  );
}
