
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden pt-16 md:pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background z-10"></div>
        <div className="absolute top-0 right-0 w-2/3 h-[600px] bg-primary/5 rounded-bl-[100px] md:rounded-bl-[200px] -z-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center pt-16 pb-16 md:py-24">
          {/* Hero content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 animate-slide-up">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Fresh From Farm to Table
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Fresh Groceries <br />
              Delivered to <br /> 
              <span className="text-primary">Your Doorstep</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-8">
              Get farm-fresh produce, organic essentials, and gourmet delights delivered directly to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="button-animation">
                Shop Now
              </Button>
              <Button variant="outline" size="lg" className="button-animation">
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero image */}
          <div className="w-full lg:w-1/2 relative animate-fade-in">
            <div className="relative aspect-square max-w-lg mx-auto">
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Fresh groceries"
                className="w-full h-full object-cover rounded-3xl shadow-lg"
              />
              
              {/* Floating elements */}
              <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-xl">
                    🥑
                  </div>
                  <div>
                    <p className="font-medium">Organic</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">100% Certified</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-xl">
                    🚚
                  </div>
                  <div>
                    <p className="font-medium">Fast Delivery</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Under 60 minutes</p>
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
