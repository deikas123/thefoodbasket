import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <section className="pt-20 md:pt-24 pb-4 md:pb-6">
      <div className="container mx-auto px-4">
        {/* Location & Search Bar - Mobile */}
        <div className="md:hidden mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Nairobi, Kenya</span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search fresh groceries..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              onFocus={() => window.location.href = '/shop'}
              readOnly
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
          {/* Main Hero Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-400 min-h-[220px] md:min-h-[340px]"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&auto=format&fit=crop&q=80"
                alt="Fresh organic vegetables and fruits"
                className="w-full h-full object-cover mix-blend-overlay opacity-50"
                loading="eager"
              />
            </div>
            
            <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3 w-fit">
                🏁 Rally Season Fresh Deals
              </span>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 md:mb-3">
                Fresh Garden
                <br />
                Products
              </h1>
              <p className="text-white/90 text-sm md:text-base mb-4 md:mb-6 max-w-md">
                Organic groceries delivered to your doorstep in Nairobi & Kiambu
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link to="/shop">
                  <Button 
                    size="lg"
                    className="rounded-full px-6 bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg text-sm md:text-base h-10 md:h-11"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Side Cards */}
          <div className="flex flex-row lg:flex-col gap-3 md:gap-4">
            {/* Rally Sale Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-red-500 to-orange-500 min-h-[140px] md:min-h-[160px]"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 p-5 md:p-6 h-full flex flex-col justify-between">
                <div>
                  <span className="text-4xl md:text-5xl font-black text-white leading-none">25%</span>
                  <span className="block text-lg md:text-xl font-bold text-white/90">OFF</span>
                </div>
                <Link to="/shop?discount=true">
                  <Button size="sm" className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold text-xs w-full">
                    Shop Sale <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Free Delivery Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400 min-h-[140px] md:min-h-[160px]"
            >
              <div className="relative z-10 p-5 md:p-6 h-full flex flex-col justify-between">
                <div>
                  <span className="text-lg md:text-xl font-bold text-white leading-tight">Free Delivery</span>
                  <p className="text-white/80 text-xs mt-1">Orders above KSh 2,000</p>
                </div>
                <Link to="/shop">
                  <Button size="sm" className="rounded-full bg-white text-amber-700 hover:bg-white/90 font-semibold text-xs w-full">
                    Order Now <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
