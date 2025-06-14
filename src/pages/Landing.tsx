
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { DealsOfTheDay } from "@/components/DealsOfTheDay";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <DealsOfTheDay />
    </div>
  );
};

export default Landing;
