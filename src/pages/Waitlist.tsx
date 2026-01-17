import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Leaf, ShoppingBasket, Truck, Gift, Sparkles, Users, Star, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

      try {
        await supabase.functions.invoke('waitlist-notification', {
          body: { name, email, phone }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  const valueProps = [
    { icon: Gift, title: "10% Off First Order", description: "Early access members get exclusive launch discount", color: "from-pink-500 to-rose-500" },
    { icon: Leaf, title: "Farm-Fresh Produce", description: "Sourced directly from local farmers", color: "from-green-500 to-emerald-500" },
    { icon: Truck, title: "Free Delivery", description: "No delivery fees for our waitlist members", color: "from-blue-500 to-cyan-500" },
    { icon: ShoppingBasket, title: "Customizable Baskets", description: "Choose what you want, when you want it", color: "from-orange-500 to-amber-500" },
  ];

  const stats = [
    { value: "2,500+", label: "On Waitlist", icon: Users },
    { value: "50+", label: "Local Farmers", icon: Leaf },
    { value: "4.9", label: "Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                animate={pulseAnimation}
              >
                <Sparkles className="w-4 h-4" />
                Coming Soon to Your Area
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold text-foreground leading-tight"
                variants={itemVariants}
              >
                <span className="inline-block">🥦</span> Fresh. Local. 
                <span className="block bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                  Delivered.
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground"
                variants={itemVariants}
              >
                Get your Food Basket first!
              </motion.p>
              
              <motion.p 
                className="text-lg text-muted-foreground"
                variants={itemVariants}
              >
                Join our waitlist for early access to our farm-fresh baskets — straight from local growers.
              </motion.p>
              
              <motion.div variants={itemVariants}>
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Join the Waitlist
                  <motion.span
                    className="ml-2"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </motion.span>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="flex gap-8 pt-6"
                variants={itemVariants}
              >
                {stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <stat.icon className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80"
                alt="Fresh Food Basket"
                className="w-full h-full object-cover"
                animate={floatingAnimation}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Floating badges */}
              <motion.div
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                animate={{ y: [0, -5, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-sm font-medium text-green-600">🌿 100% Organic</span>
              </motion.div>
              
              <motion.div
                className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                animate={{ y: [0, 5, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <span className="text-sm font-medium text-primary">🚚 Free Delivery</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-secondary/5 relative">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Join Our Waitlist?
          </motion.h2>
          <motion.p
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Exclusive benefits for our early supporters
          </motion.p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, idx) => (
              <motion.div
                key={idx}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:border-primary/20">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${prop.color} flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <prop.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{prop.title}</h3>
                  <p className="text-muted-foreground">{prop.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section id="signup-form" className="py-20 bg-gradient-to-br from-primary via-primary/90 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        
        {/* Animated shapes */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white/10 rounded-xl"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div 
                  key="form"
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-white mb-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Join the Waitlist
                  </motion.h2>
                  <motion.p 
                    className="text-white/80 text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Be the first to experience fresh, local produce delivered to your door
                  </motion.p>
                  
                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {/* Form fields */}
                    <motion.input
                      type="text"
                      placeholder="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.input
                      type="email"
                      placeholder="Your Email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.input
                      type="tel"
                      placeholder="Phone Number (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.input
                      type="text"
                      placeholder="City/Town Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      whileFocus={{ scale: 1.02 }}
                    />
                    
                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">How did you hear about us?</Label>
                      <RadioGroup value={referralSource} onValueChange={setReferralSource}>
                        {["Social media", "Friend/Referral", "Online search", "Other"].map((source) => (
                          <motion.div 
                            key={source} 
                            className="flex items-center space-x-2"
                            whileHover={{ x: 5 }}
                          >
                            <RadioGroupItem value={source} id={source} className="border-white/40 text-white" />
                            <Label htmlFor={source} className="text-white/90 cursor-pointer font-normal">{source}</Label>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">What interests you most?</Label>
                      {["Fresh & organic produce", "Affordable food prices", "Convenience of home delivery", "Supporting local farmers"].map((interest) => (
                        <motion.div 
                          key={interest} 
                          className="flex items-center space-x-2"
                          whileHover={{ x: 5 }}
                        >
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
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">Products you buy most often?</Label>
                      {["Fruits", "Vegetables", "Grains & cereals", "Meat & poultry", "Dairy & eggs", "Household essentials"].map((product) => (
                        <motion.div 
                          key={product} 
                          className="flex items-center space-x-2"
                          whileHover={{ x: 5 }}
                        >
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
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">How often do you shop for groceries?</Label>
                      <RadioGroup value={shoppingFrequency} onValueChange={setShoppingFrequency}>
                        {["Daily", "Weekly", "Every two weeks", "Monthly"].map((freq) => (
                          <motion.div 
                            key={freq} 
                            className="flex items-center space-x-2"
                            whileHover={{ x: 5 }}
                          >
                            <RadioGroupItem value={freq} id={freq} className="border-white/40 text-white" />
                            <Label htmlFor={freq} className="text-white/90 cursor-pointer font-normal">{freq}</Label>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">Preferred delivery time:</Label>
                      <RadioGroup value={preferredDeliveryTime} onValueChange={setPreferredDeliveryTime}>
                        {["Morning", "Afternoon", "Evening"].map((time) => (
                          <motion.div 
                            key={time} 
                            className="flex items-center space-x-2"
                            whileHover={{ x: 5 }}
                          >
                            <RadioGroupItem value={time} id={time} className="border-white/40 text-white" />
                            <Label htmlFor={time} className="text-white/90 cursor-pointer font-normal">{time}</Label>
                          </motion.div>
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
                      <motion.div 
                        className="flex items-center space-x-2"
                        whileHover={{ x: 5 }}
                      >
                        <Checkbox
                          id="earlyAccess"
                          checked={wantsEarlyAccess}
                          onCheckedChange={(checked) => setWantsEarlyAccess(checked as boolean)}
                          className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                        />
                        <Label htmlFor="earlyAccess" className="text-white/90 cursor-pointer font-normal">
                          I want early access to offers and discounts
                        </Label>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        whileHover={{ x: 5 }}
                      >
                        <Checkbox
                          id="betaTesting"
                          checked={wantsBetaTesting}
                          onCheckedChange={(checked) => setWantsBetaTesting(checked as boolean)}
                          className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                        />
                        <Label htmlFor="betaTesting" className="text-white/90 cursor-pointer font-normal">
                          I'm interested in being a beta tester for new features
                        </Label>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-primary hover:bg-white/90 rounded-full py-6 text-lg font-semibold shadow-lg"
                      >
                        {loading ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⏳
                          </motion.span>
                        ) : (
                          "Get Early Access 🎉"
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border border-white/20"
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <motion.div 
                    className="flex justify-center mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <CheckCircle2 className="w-24 h-24 text-white" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    You're In! 🎉
                  </motion.h2>
                  
                  <motion.p 
                    className="text-xl text-white/90 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Check your email for confirmation and your exclusive 10% discount code
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate("/")}
                      className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-3 text-lg font-semibold shadow-lg"
                    >
                      Explore Our Platform
                    </Button>
                  </motion.div>
                  
                  {/* Confetti effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                          left: `${Math.random() * 100}%`,
                          top: -10,
                        }}
                        animate={{
                          y: [0, 500],
                          x: [0, (Math.random() - 0.5) * 200],
                          rotate: [0, 360],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          delay: Math.random() * 0.5,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.section 
        className="py-12 bg-background"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 The Food Basket. All rights reserved.
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Waitlist;