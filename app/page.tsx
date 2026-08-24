import Hero from "@/components/sections/hero";
import MarqueeStrip from "@/components/sections/marquee-strip";
import Categories from "@/components/sections/categories";
import HowItWorks from "@/components/sections/how-it-works";
import Featured from "@/components/sections/featured";
import Stats from "@/components/sections/stats";
import Testimonials from "@/components/sections/testimonials";
import Cta from "@/components/sections/cta";
import { getApprovedReviews, getFeaturedProducts, getAllProductImages } from "@/lib/server/catalog";

export default async function Home() {
  const [reviews, featured, allImages] = await Promise.all([
    getApprovedReviews(),
    getFeaturedProducts(8),
    getAllProductImages(),
  ]);
  return (
    <main id="top" className="relative">
      <Hero />
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
