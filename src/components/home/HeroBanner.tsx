import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "You'll receive our best deals and updates.",
      });
      setEmail("");
    }
  };

  return (
    <section className="pt-20 md:pt-24 pb-4 md:pb-6">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Hero Banner */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 min-h-[280px] md:min-h-[340px]">
            {/* Background image overlay */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&auto=format&fit=crop&q=80"
                alt="Fresh organic vegetables and fruits for grocery delivery in Nairobi, Kenya"
                className="w-full h-full object-cover mix-blend-overlay opacity-60"
                loading="eager"
              />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                Fresh Garden
                <br />
                Products
              </h1>
              <p className="text-white/90 text-base md:text-lg mb-6 max-w-md">
                Choose your organic fresh groceries delivered right to your doorstep
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link to="/shop">
                  <Button 
                    size="lg"
                    className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
                  >
                    Shop Now
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="rounded-full px-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                  >
                    View More
                  </Button>
                </Link>
              </div>
              
              {/* Dots indicator */}
              <div className="flex gap-2 mt-6">
                <div className="w-8 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
            </div>
          </div>

          {/* Weekend Sale Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 min-h-[200px] md:min-h-[340px]">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                  Weekend Sale!
                </span>
                <div className="mb-4">
                  <span className="block text-5xl md:text-6xl font-black text-white leading-none">
                    25%
                  </span>
                  <span className="block text-3xl md:text-4xl font-bold text-white/90">
                    OFF
                  </span>
                </div>
              </div>
              
              <Link to="/shop?discount=true">
                <Button 
                  className="rounded-full w-full bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-lg"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Promotional Strip */}
        <div className="mt-4 bg-yellow-400 dark:bg-yellow-500 rounded-2xl py-3 px-6 flex items-center justify-center">
          <p className="text-yellow-900 font-medium text-sm md:text-base text-center">
            🌿 Don't miss the discount on these Garden products — 
            <Link to="/shop" className="underline font-semibold ml-1 hover:text-yellow-800">
              Shop fresh picks now!
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
