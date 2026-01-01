import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useCart } from "@/context/CartContext";
import AdminBanner from "@/components/AdminBanner";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import { RecentlyViewedProducts } from "@/components/product/RecentlyViewedProducts";
import Waitlist from "@/pages/Waitlist";
import MaintenancePage from "@/pages/MaintenancePage";
import PromoPage from "@/pages/PromoPage";
import { getHomepageMode, HomepageMode } from "@/services/contentService";
import NewYearFireworks from "@/components/NewYearFireworks";

// Home page components
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import PromoBanners from "@/components/home/PromoBanners";
import PopularProducts from "@/components/home/PopularProducts";
import DailyOffersSection from "@/components/home/DailyOffersSection";

const Index = () => {
  const cartContext = useCart();
  const [homepageMode, setHomepageMode] = useState<HomepageMode | null>(null);
  const [showFireworks, setShowFireworks] = useState(true);
  
  useEffect(() => {
    const checkHomepageMode = async () => {
      const mode = await getHomepageMode();
      setHomepageMode(mode);
    };
    checkHomepageMode();
    
    // Hide fireworks after 15 seconds
    const fireworksTimeout = setTimeout(() => setShowFireworks(false), 15000);
    return () => clearTimeout(fireworksTimeout);
  }, []);
  
  if (!cartContext || homepageMode === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Render based on homepage mode
  if (homepageMode === 'waitlist') {
    return <Waitlist />;
  }

  if (homepageMode === 'maintenance') {
    return <MaintenancePage />;
  }

  if (homepageMode === 'promo') {
    return <PromoPage />;
  }

  // Normal homepage
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      {showFireworks && <NewYearFireworks />}
      <Header />
      <main className="flex-grow">
        {/* Hero Banner with subscription */}
        <HeroBanner />
        
        {/* Featured Categories carousel */}
        <FeaturedCategories />
        
        {/* Three Promotional Banners */}
        <PromoBanners />
        
        {/* Admin Promotional Banner */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <AdminBanner />
          </div>
        </section>
        
        {/* Daily Offers */}
        <DailyOffersSection />

        {/* Popular Products with category tabs */}
        <PopularProducts />
        
        {/* Recently Viewed */}
        <section className="py-4 md:py-6">
          <div className="container mx-auto px-4">
            <RecentlyViewedProducts />
          </div>
        </section>
      </main>
      
      <Footer />
      <Cart />
      <BottomNavigation />
    </div>
  );
};

export default Index;
