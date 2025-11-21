import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useCart } from "@/context/CartContext";
import AdminBanner from "@/components/AdminBanner";
import OtherProducts from "@/components/OtherProducts";
import DailyOffersSection from "@/components/home/DailyOffersSection";
import TopGroceryStores from "@/components/home/TopGroceryStores";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import { RecentlyViewedProducts } from "@/components/product/RecentlyViewedProducts";
import { SmartRecommendations } from "@/components/product/SmartRecommendations";
import { PersonalizedBundleRecommendations } from "@/components/product/PersonalizedBundleRecommendations";

const Index = () => {
  const cartContext = useCart();
  
  // Guard against undefined context during initial render
  if (!cartContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  const { addItem } = cartContext;

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Admin Promotional Banner */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <AdminBanner />
          </div>
        </section>
        
        {/* Top Grocery Stores Section */}
        <TopGroceryStores />
        
        {/* Daily Offers Section */}
        <section className="py-4 md:py-6">
          <DailyOffersSection />
        </section>

        {/* Recently Viewed & Smart Recommendations */}
        <section className="py-4 md:py-6">
          <div className="container mx-auto px-4">
            <RecentlyViewedProducts />
            <PersonalizedBundleRecommendations />
            <SmartRecommendations title="Recommended For You" limit={8} />
          </div>
        </section>
        
        {/* Featured Products Section */}
        <section className="py-4 md:py-6">
          <FeaturedProducts />
        </section>
        
        {/* Other Products Section */}
        <section className="py-4 md:py-6">
          <OtherProducts />
        </section>
        
      </main>
      
      <Footer />
      <Cart />
      <BottomNavigation />
    </div>
  );
};

export default Index;
