import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Categories from "@/components/Categories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, Clock, HeartHandshake } from "lucide-react";
import AdminBanner from "@/components/AdminBanner";
import OtherProducts from "@/components/OtherProducts";
import DailyOffersSection from "@/components/home/DailyOffersSection";

const Index = () => {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Admin Promotional Banner */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <AdminBanner />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-10 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center p-4 animate-fade-in">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <Truck size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Free Delivery</h3>
                <p className="text-muted-foreground text-sm">
                  Free delivery on all orders over $50 within city limits.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">100% Organic</h3>
                <p className="text-muted-foreground text-sm">
                  All our fresh produce is certified organic and locally sourced.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <HeartHandshake size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Satisfaction Guaranteed</h3>
                <p className="text-muted-foreground text-sm">
                  Not satisfied? We offer hassle-free returns and refunds.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <Clock size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Express Delivery</h3>
                <p className="text-muted-foreground text-sm">
                  Need it fast? Choose our express delivery option for same-day service.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Daily Offers Section - NEW */}
        <DailyOffersSection />
        
        {/* Categories Section */}
        <Categories />
        
        {/* Other Products Section */}
        <OtherProducts />
        
        {/* Featured Products Section */}
        <FeaturedProducts />
        
        {/* Newsletter Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white dark:bg-black/30 rounded-2xl shadow-sm p-8 md:p-12 text-center glass">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                Stay Updated
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get the latest updates on new products, seasonal specials, and exclusive offers delivered straight to your inbox.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button className="whitespace-nowrap button-animation">
                  Subscribe
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <Cart />
    </div>
  );
};

export default Index;
