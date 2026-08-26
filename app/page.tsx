import Hero from "@/components/sections/hero";
import MarqueeStrip from "@/components/sections/marquee-strip";
import Categories from "@/components/sections/categories";
import HowItWorks from "@/components/sections/how-it-works";
import Featured from "@/components/sections/featured";
import Stats from "@/components/sections/stats";
import Testimonials from "@/components/sections/testimonials";
import Cta from "@/components/sections/cta";
import { getApprovedReviews, getFeaturedProducts, getAllProductImages } from "@/lib/server/catalog";
import { primaryImage } from "@/lib/product-media";

export default async function Home() {
  const [reviews, featured, allImages] = await Promise.all([
    getApprovedReviews(),
    getFeaturedProducts(8),
    getAllProductImages(),
  ]);
  // featured product images for the hero background wall (slide show)
  const heroImages = featured.map((p) =>
    primaryImage(p.slug, allImages.filter((i) => i.product_id === p.id))
  );
  return (
    <main id="top" className="relative">
      <Hero wallImages={heroImages} />
      <MarqueeStrip />
      <Categories />
      <HowItWorks />
      <Featured products={featured} images={allImages} />
      <Stats />
      <Testimonials approved={reviews} />
      <Cta />
    </main>
  );
}
