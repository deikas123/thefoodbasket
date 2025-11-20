import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Leaf, ShoppingBasket, Truck, Gift } from "lucide-react";

const Waitlist = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [shoppingFrequency, setShoppingFrequency] = useState("");
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState("");
  const [groceryChallenges, setGroceryChallenges] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [wantsEarlyAccess, setWantsEarlyAccess] = useState(true);
  const [wantsBetaTesting, setWantsBetaTesting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("waitlist").insert([
        { 
          name, 
          email, 
          phone: phone || null,
          location: location || null,
          referral_source: referralSource || null,
          interests,
          product_types: productTypes,
          shopping_frequency: shoppingFrequency || null,
          preferred_delivery_time: preferredDeliveryTime || null,
          grocery_challenges: groceryChallenges || null,
          value_proposition: valueProposition || null,
          wants_early_access: wantsEarlyAccess,
          wants_beta_testing: wantsBetaTesting,
        },
      ]);

      if (error) throw error;

      // Send notification to admin and user
      try {
        await supabase.functions.invoke('waitlist-notification', {
          body: {
            name,
            email,
            phone
          }
        });
      } catch (notifError) {
        console.error("Failed to send notifications:", notifError);
      }

      setSubmitted(true);
      toast.success("You're on the list! Check your email! 🎉");
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
            <div className="space-y-6">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-lg shadow-lg"
                onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join the Waitlist
              </Button>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80"
                alt="Fresh Food Basket"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Why Join Our Waitlist?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="flex justify-center">
                <Gift className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">10% Off First Order</h3>
              <p className="text-muted-foreground">Early access members get exclusive launch discount</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="flex justify-center">
                <Leaf className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Farm-Fresh Produce</h3>
              <p className="text-muted-foreground">Sourced directly from local farmers</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="flex justify-center">
                <Truck className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Free Delivery</h3>
              <p className="text-muted-foreground">No delivery fees for our waitlist members</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="flex justify-center">
                <ShoppingBasket className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Customizable Baskets</h3>
              <p className="text-muted-foreground">Choose what you want, when you want it</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section id="signup-form" className="py-16 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            {!submitted ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
                  Join the Waitlist
                </h2>
                <p className="text-white/80 text-center mb-8">
                  Be the first to experience fresh, local produce delivered to your door
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="City/Town Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />
                  
                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">How did you hear about us?</Label>
                    <RadioGroup value={referralSource} onValueChange={setReferralSource}>
                      {["Social media", "Friend/Referral", "Online search", "Other"].map((source) => (
                        <div key={source} className="flex items-center space-x-2">
                          <RadioGroupItem value={source} id={source} className="border-white/40 text-white" />
                          <Label htmlFor={source} className="text-white/90 cursor-pointer font-normal">{source}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">What interests you most? (Select all that apply)</Label>
                    {[
                      "Fresh & organic produce",
                      "Affordable food prices",
                      "Convenience of home delivery",
                      "Supporting local farmers",
                    ].map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={interests.includes(interest)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInterests([...interests, interest]);
                            } else {
                              setInterests(interests.filter((i) => i !== interest));
                            }
                          }}
                          className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                        />
                        <Label htmlFor={interest} className="text-white/90 cursor-pointer font-normal">{interest}</Label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">Products you buy most often? (Select all that apply)</Label>
                    {[
                      "Fruits",
                      "Vegetables",
                      "Grains & cereals",
                      "Meat & poultry",
                      "Dairy & eggs",
                      "Household essentials",
                    ].map((product) => (
                      <div key={product} className="flex items-center space-x-2">
                        <Checkbox
                          id={product}
                          checked={productTypes.includes(product)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setProductTypes([...productTypes, product]);
                            } else {
                              setProductTypes(productTypes.filter((p) => p !== product));
                            }
                          }}
                          className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                        />
                        <Label htmlFor={product} className="text-white/90 cursor-pointer font-normal">{product}</Label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">How often do you shop for groceries?</Label>
                    <RadioGroup value={shoppingFrequency} onValueChange={setShoppingFrequency}>
                      {["Daily", "Weekly", "Every two weeks", "Monthly"].map((freq) => (
                        <div key={freq} className="flex items-center space-x-2">
                          <RadioGroupItem value={freq} id={freq} className="border-white/40 text-white" />
                          <Label htmlFor={freq} className="text-white/90 cursor-pointer font-normal">{freq}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">Preferred delivery time:</Label>
                    <RadioGroup value={preferredDeliveryTime} onValueChange={setPreferredDeliveryTime}>
                      {["Morning", "Afternoon", "Evening"].map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <RadioGroupItem value={time} id={time} className="border-white/40 text-white" />
                          <Label htmlFor={time} className="text-white/90 cursor-pointer font-normal">{time}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Textarea
                    placeholder="What challenge do you currently face when buying groceries?"
                    value={groceryChallenges}
                    onChange={(e) => setGroceryChallenges(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all min-h-[100px] resize-none"
                  />

                  <Textarea
                    placeholder="What would make The Food Basket most valuable to you?"
                    value={valueProposition}
                    onChange={(e) => setValueProposition(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all min-h-[100px] resize-none"
                  />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="earlyAccess"
                        checked={wantsEarlyAccess}
                        onCheckedChange={(checked) => setWantsEarlyAccess(checked as boolean)}
                        className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                      />
                      <Label htmlFor="earlyAccess" className="text-white/90 cursor-pointer font-normal">
                        I want early access to offers and discounts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="betaTesting"
                        checked={wantsBetaTesting}
                        onCheckedChange={(checked) => setWantsBetaTesting(checked as boolean)}
                        className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                      />
                      <Label htmlFor="betaTesting" className="text-white/90 cursor-pointer font-normal">
                        I'm interested in being a beta tester for new features
                      </Label>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-primary hover:bg-white/90 rounded-full py-6 text-lg font-semibold shadow-lg"
                  >
                    {loading ? "Joining..." : "Get Early Access 🎉"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center shadow-2xl border border-white/20">
                <div className="flex justify-center mb-6">
                  <CheckCircle2 className="w-20 h-20 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  You're In! 🎉
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Check your email for confirmation and your exclusive 10% discount code
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-3 text-lg font-semibold"
                >
                  Explore Our Platform
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">The Food Basket</h3>
              <p className="text-muted-foreground">Fresh from the farm to your door</p>
            </div>
            <div className="flex gap-6">
              <Button variant="ghost" onClick={() => navigate("/about")}>About</Button>
              <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;