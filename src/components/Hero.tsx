
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden pt-16 md:pt-20">
      <div className="container mx-auto px-4">
        {/* Promotional Banner Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-green-900/40 shadow-xl mt-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 items-center p-8 md:p-12">
            {/* Left Content */}
            <div className="space-y-5">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                  Vegetable Offers
                </h2>
                <Badge className="bg-accent text-accent-foreground text-base font-bold px-4 py-1.5">
                  20% OFF
                </Badge>
              </div>
              <p className="text-base text-muted-foreground">
                10 October, 2025
              </p>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-md hover:shadow-lg transition-shadow"
                onClick={() => navigate('/shop')}
              >
                Get Now
              </Button>
            </div>

            {/* Right Image */}
            <div className="relative h-56 md:h-64">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt="Fresh vegetables"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
