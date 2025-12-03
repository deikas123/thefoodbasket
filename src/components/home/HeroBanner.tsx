import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

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
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-green-900/40">
          <div className="grid md:grid-cols-2 gap-6 items-center p-6 md:p-10 lg:p-14">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6 z-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Fresh Vegetables
                <br />
                <span className="text-primary">Big discount</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Save up to <span className="font-semibold text-primary">50% off</span> on your first order
              </p>
              
              {/* Email Subscription */}
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-background/80 backdrop-blur-sm border-border/50 rounded-full px-5 h-12"
                />
                <Button 
                  type="submit"
                  className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Subscribe
                </Button>
              </form>
              
              {/* Dots indicator */}
              <div className="flex gap-2 pt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30"></div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-48 md:h-72 lg:h-80">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt="Fresh vegetables and groceries"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
