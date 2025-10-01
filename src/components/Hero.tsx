
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/shop');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="relative w-full overflow-hidden pt-8 md:pt-12 pb-6 md:pb-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background/50 z-10"></div>
        <div className="absolute top-0 right-0 w-2/3 h-[400px] bg-primary/5 rounded-bl-[60px] md:rounded-bl-[120px] -z-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center py-8 md:py-12">
          {/* Hero content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 animate-slide-up">
            <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-3">
              Fresh From Farm to Table
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4">
              Fresh Groceries <br />
              Delivered to <br /> 
              <span className="text-primary">Your Doorstep</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 mb-4 md:mb-6">
              Get farm-fresh produce, organic essentials, and gourmet delights delivered directly to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="default" className="button-animation bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleShopNow}>
                Shop Now
              </Button>
              <Button variant="outline" size="default" className="button-animation" onClick={handleLearnMore}>
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero image */}
          <div className="w-full lg:w-1/2 relative animate-fade-in">
            <div className="relative aspect-square max-w-md mx-auto">
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Fresh groceries"
                className="w-full h-full object-cover rounded-3xl shadow-lg"
              />
              
              {/* Floating elements */}
              <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 p-3 md:p-4 bg-card rounded-2xl shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-lg">
                    🥑
                  </div>
                  <div>
                    <p className="font-medium text-sm">Organic</p>
                    <p className="text-xs text-muted-foreground">100% Certified</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 p-3 md:p-4 bg-card rounded-2xl shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-lg">
                    🚚
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">Under 60 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
