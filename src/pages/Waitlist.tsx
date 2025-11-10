import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Leaf, ShoppingBasket, Truck, Gift } from "lucide-react";

const Waitlist = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ 
          name: formData.name, 
          email: formData.email,
          phone: formData.phone || null
        }]);

      if (error) throw error;

      // Send notification to admin
      try {
        await supabase.functions.invoke('waitlist-notification', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        });
      } catch (notifError) {
        console.error("Failed to send admin notification:", notifError);
        // Don't fail the signup if notification fails
      }

      setSubmitted(true);
      toast.success("You're on the list! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                🥦 Fresh. Local. Delivered.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Get your Food Basket first!
              </p>
              <p className="text-lg text-muted-foreground">
                Join our waitlist for early access to our farm-fresh baskets — straight from local growers.
              </p>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-lg shadow-lg hover-scale"
                onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join the Waitlist
              </Button>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <img
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80"
                alt="Fresh Food Basket"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground animate-fade-in">
            Why Join Our Waitlist?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center hover-scale">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">100% Local Produce</h3>
              <p className="text-muted-foreground">Sourced directly from local farms</p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center hover-scale">
                <ShoppingBasket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Handpicked Weekly Baskets</h3>
              <p className="text-muted-foreground">Curated selection of fresh produce</p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center hover-scale">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Doorstep Delivery</h3>
              <p className="text-muted-foreground">Convenient delivery to your door</p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center hover-scale">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Exclusive Launch Discount</h3>
              <p className="text-muted-foreground">10% off for waitlist members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground animate-fade-in">
            Fresh from the Farm
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative h-64 rounded-xl overflow-hidden shadow-lg animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80"
                alt="Fresh vegetables"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden shadow-lg animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80"
                alt="Farm fresh produce"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden shadow-lg animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <img
                src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80"
                alt="Organic vegetables"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section id="signup-form" className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4 max-w-2xl">
          {!submitted ? (
            <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-border animate-scale-in">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
                Join the Waitlist
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Be the first to know when we launch. Get 10% off your first order!
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll never spam you. Unsubscribe anytime.
                </p>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                  disabled={loading}
                >
                  {loading ? "Joining..." : "Join Now"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 text-center border border-border animate-scale-in">
              <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6 animate-scale-in" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                You're on the list! 🎉
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We'll notify you first when baskets launch.
              </p>
              <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                <p className="text-lg font-semibold text-primary">
                  Get 10% off your first order when you join today!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/20 py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <p className="text-lg font-semibold text-foreground">
              Join the waitlist — freshness is almost here!
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <div className="pt-6">
              <button
                onClick={() => navigate('/home')}
                className="text-xs text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
              >
                •
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;
