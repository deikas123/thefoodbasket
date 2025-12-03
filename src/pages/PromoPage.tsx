import { useState } from "react";
import { Sparkles, Gift, Clock, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PromoPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("You're subscribed! Check your email for exclusive offers.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited Time Offer
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Get <span className="text-primary">50% OFF</span>
            <br />
            Your First Order
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Fresh groceries delivered to your doorstep. Sign up now and enjoy 
            exclusive discounts on premium quality products.
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-4">
            {[
              { value: "02", label: "Days" },
              { value: "14", label: "Hours" },
              { value: "36", label: "Minutes" },
              { value: "52", label: "Seconds" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-background shadow-lg flex items-center justify-center border border-border">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{item.value}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-2 block">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Email Subscription */}
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-5 h-12"
            />
            <Button type="submit" className="rounded-full px-6 h-12 gap-2">
              <Gift className="w-4 h-4" />
              Get Offer
            </Button>
          </form>

          {/* CTA Button */}
          <Button
            size="lg"
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => navigate('/shop')}
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-background/50 backdrop-blur-sm py-12 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Same Day Delivery",
                description: "Order before 2 PM for same-day delivery"
              },
              {
                icon: Star,
                title: "Premium Quality",
                description: "Hand-picked fresh products from trusted sources"
              },
              {
                icon: Gift,
                title: "Loyalty Rewards",
                description: "Earn points on every purchase"
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 rounded-2xl bg-background border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Preview */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
          <p className="text-muted-foreground">Check out our top sellers</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Fresh Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop", discount: "30%" },
            { name: "Organic Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=300&fit=crop", discount: "25%" },
            { name: "Dairy Products", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=300&fit=crop", discount: "20%" },
            { name: "Fresh Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop", discount: "15%" },
          ].map((product, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden bg-background border border-border/50 group cursor-pointer" onClick={() => navigate('/shop')}>
              <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground">
                {product.discount} OFF
              </Badge>
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-3">
                <h3 className="font-medium text-foreground text-sm">{product.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoPage;
