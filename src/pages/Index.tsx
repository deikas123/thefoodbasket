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

// Home page components
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TopStores from "@/components/home/TopStores";
import PopularProducts from "@/components/home/PopularProducts";
import DailyOffersSection from "@/components/home/DailyOffersSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import BenefitsStrip from "@/components/home/BenefitsStrip";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ContactStrip from "@/components/home/ContactStrip";

const Index = () => {
  const cartContext = useCart();
  // Default to 'normal' so we render immediately, then check async
  const [homepageMode, setHomepageMode] = useState<HomepageMode>('home');
  
  useEffect(() => {
    getHomepageMode().then(setHomepageMode).catch(() => {});
  }, []);

  if (homepageMode === 'waitlist') return <Waitlist />;
  if (homepageMode === 'maintenance') return <MaintenancePage />;
  if (homepageMode === 'promo') return <PromoPage />;

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-grow">
        <HeroBanner />
        <FeaturedCategories />
        <FlashSaleSection />
        <PopularProducts />
        
        <section className="py-2">
          <div className="container mx-auto px-4">
            <AdminBanner />
          </div>
        </section>
        
        <DailyOffersSection />
        <TopStores />
        
        <section className="py-4 md:py-6">
          <div className="container mx-auto px-4">
            <RecentlyViewedProducts />
          </div>
        </section>
        
        <HowItWorksSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
        <ContactStrip />
        <BenefitsStrip />
      </main>
      
      <Footer />
      <Cart />
      <BottomNavigation />
    </div>
  );
};

export default Index;
