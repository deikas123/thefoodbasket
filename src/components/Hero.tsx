
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden pt-16 md:pt-20">
      <div className="container mx-auto px-4">
        {/* Promotional Banner Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 shadow-lg mt-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4 items-center p-6 md:p-8">
            {/* Left Content */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Vegetable Offers
                </h2>
                <Badge className="bg-accent text-accent-foreground text-sm font-bold px-3 py-1">
                  20% OFF
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                10 October, 2025
              </p>
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                onClick={() => navigate('/shop')}
              >
                Get Now
              </Button>
            </div>

            {/* Right Image */}
            <div className="relative h-48 md:h-56">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt="Fresh vegetables"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
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
