import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CheckCircle2, Leaf, ShoppingBasket, Truck, Gift, Sparkles, Users, Star, 
  ArrowDown, Play, ChevronLeft, ChevronRight, Smartphone, Clock, MapPin, CreditCard,
  Heart, Bell, Search, Home, User, ShoppingCart, Zap, Shield, Timer, MousePointer2,
  Hand, ArrowRight, Eye, Plus
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animation = animate(count, value, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span>{displayValue.toLocaleString()}</span>;
};

// Mock phone screen component for app preview
const PhoneScreen = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative bg-background rounded-[2.5rem] p-2 shadow-2xl border-4 border-foreground/10 ${className}`}>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-b-xl" />
    <div className="bg-background rounded-[2rem] overflow-hidden h-full">
      {children}
    </div>
  </div>
);

// Interactive product card for preview
const InteractiveProductCard = ({ item, index, onAdd }: { 
  item: { name: string; price: string; img: string; discount: string | null }; 
  index: number;
  onAdd: () => void;
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAdd = () => {
    setIsAdded(true);
    onAdd();
    setTimeout(() => setIsAdded(false), 1500);
  };
  
  return (
    <motion.div 
      className="bg-card rounded-xl p-3 border relative cursor-pointer group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleAdd}
    >
      {item.discount && (
        <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
          {item.discount}
        </span>
      )}
      <div className="text-3xl mb-2 transition-transform group-hover:scale-110">{item.img}</div>
      <p className="text-xs font-medium truncate">{item.name}</p>
      <p className="text-xs text-primary font-bold">{item.price}</p>
      
      {/* Add to cart button overlay */}
      <AnimatePresence>
        {isHovered && !isAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-primary/90 rounded-xl flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.div>
        )}
        {isAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-green-500 rounded-xl flex items-center justify-center"
          >
            <CheckCircle2 className="w-6 h-6 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// App preview screens with interactivity
const AppPreviewContent = ({ screenId, onInteraction }: { screenId: string; onInteraction: () => void }) => {
  const [cartCount, setCartCount] = useState(0);
  
  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    onInteraction();
  };

  if (screenId === "home") {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <ShoppingBasket className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">The Food Basket</span>
          </div>
          <div className="flex gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </div>
          </div>
        </div>
        <motion.div 
          className="bg-muted rounded-xl p-3 flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search fresh produce...</span>
        </motion.div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Avocados", price: "KSh 50", img: "🥑", discount: "-20%" },
            { name: "Tomatoes", price: "KSh 30", img: "🍅", discount: null },
            { name: "Spinach", price: "KSh 40", img: "🥬", discount: "-15%" },
            { name: "Mangoes", price: "KSh 80", img: "🥭", discount: null },
          ].map((item, i) => (
            <InteractiveProductCard 
              key={i} 
              item={item} 
              index={i} 
              onAdd={handleAddToCart}
            />
          ))}
        </div>
        
        {/* Tap hint */}
        <motion.div 
          className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Hand className="w-3 h-3" />
          Tap products to add to cart
        </motion.div>
      </div>
    );
  }
  
  if (screenId === "cart") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold">Your Cart</h3>
        <div className="space-y-3">
          {[
            { name: "Fresh Avocados (6pc)", price: "KSh 300", img: "🥑" },
            { name: "Organic Tomatoes (1kg)", price: "KSh 120", img: "🍅" },
            { name: "Farm Eggs (Tray)", price: "KSh 450", img: "🥚" },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              className="flex items-center gap-3 bg-card rounded-xl p-3 border cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <span className="text-2xl">{item.img}</span>
              <div className="flex-1">
                <p className="text-xs font-medium">{item.name}</p>
                <p className="text-xs text-primary font-bold">{item.price}</p>
              </div>
              <motion.div 
                className="flex items-center gap-2 bg-muted rounded-full px-2 py-1"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-xs cursor-pointer hover:text-primary">-</span>
                <span className="text-xs font-medium">2</span>
                <span className="text-xs cursor-pointer hover:text-primary">+</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="bg-primary/10 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Subtotal</span>
            <span>KSh 870</span>
          </div>
          <div className="flex justify-between text-xs text-green-600">
            <span>Delivery</span>
            <span>FREE</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">KSh 870</span>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full text-xs h-10" size="sm" onClick={onInteraction}>
            Checkout Now →
          </Button>
        </motion.div>
      </div>
    );
  }
  
  // Tracking screen
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <motion.div 
          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Truck className="w-4 h-4 text-white" />
        </motion.div>
        <div>
          <p className="text-xs font-semibold">Order #FBK-2847</p>
          <p className="text-[10px] text-green-600">On the way!</p>
        </div>
      </div>
      <div className="bg-muted rounded-xl p-3 h-32 flex items-center justify-center relative overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10" />
        <motion.div 
          className="relative z-10"
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Truck className="w-10 h-10 text-primary" />
        </motion.div>
        <motion.div
          className="absolute bottom-2 left-4 right-4 h-1 bg-muted-foreground/20 rounded-full"
        >
          <motion.div 
            className="h-full bg-primary rounded-full"
            animate={{ width: ["30%", "70%", "30%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
      <div className="space-y-3">
        {[
          { status: "Order Confirmed", time: "10:30 AM", done: true },
          { status: "Being Prepared", time: "10:45 AM", done: true },
          { status: "Out for Delivery", time: "11:15 AM", done: true },
          { status: "Arriving Soon", time: "~5 mins", done: false },
        ].map((step, i) => (
          <motion.div 
            key={i} 
            className="flex items-center gap-3 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            whileHover={{ x: 5 }}
          >
            <motion.div 
              className={`w-4 h-4 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500' : 'bg-muted border-2 border-primary'}`}
              animate={!step.done ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {step.done && <CheckCircle2 className="w-3 h-3 text-white" />}
            </motion.div>
            <div className="flex-1">
              <p className={`text-xs ${step.done ? 'text-muted-foreground' : 'font-semibold'}`}>{step.status}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{step.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// App preview screens metadata
const appScreens = [
  { id: "home", title: "Browse Fresh Products" },
  { id: "cart", title: "Easy Checkout" },
  { id: "tracking", title: "Real-time Tracking" },
];

const Waitlist = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [wantsEarlyAccess, setWantsEarlyAccess] = useState(true);
  const [wantsBetaTesting, setWantsBetaTesting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showForm, setShowForm] = useState(false);
  
  // Launch countdown (set to 30 days from now for demo)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate screens
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % appScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone: phone || null,
        location: location || null,
        referral_source: referralSource || null,
        interests,
        wants_early_access: wantsEarlyAccess,
        wants_beta_testing: wantsBetaTesting,
      };

      // Avoid upsert here (it may require implicit reads that can trip RLS).
      // Instead: try insert, and if the email already exists, update that row.
      const { error: insertError } = await supabase.from("waitlist").insert(payload);

      if (insertError) {
        const isDuplicate =
          insertError.code === "23505" ||
          insertError.message?.toLowerCase().includes("duplicate");

        if (!isDuplicate) throw insertError;

        const { error: updateError } = await supabase
          .from("waitlist")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("email", email);

        if (updateError) throw updateError;
      }

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

  const stats = [
    { value: 2847, label: "People Waiting", icon: Users },
    { value: 50, label: "Local Farms", icon: Leaf },
    { value: 99, label: "Launch Ready", suffix: "%", icon: Zap },
  ];

  const features = [
    { icon: Truck, title: "Free Delivery", desc: "No fees on your first 5 orders" },
    { icon: Clock, title: "30-Min Express", desc: "Lightning-fast delivery" },
    { icon: Shield, title: "Quality Promise", desc: "100% freshness guaranteed" },
    { icon: Gift, title: "VIP Rewards", desc: "Earn points on every order" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: 100 + i * 80,
              height: 100 + i * 80,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 py-6 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBasket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">The Food Basket</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={() => setShowForm(true)}
            >
              Join Waitlist
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Timer className="w-4 h-4" />
                Launching Soon
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1]">
                Fresh groceries,
                <span className="block bg-gradient-to-r from-primary via-green-500 to-emerald-500 bg-clip-text text-transparent">
                  delivered fast.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                From local farms to your doorstep in 30 minutes. Join the waitlist and be first to experience the future of grocery shopping in Kenya.
              </p>

              {/* Countdown Timer */}
              <div className="flex gap-4 md:gap-6">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-2xl shadow-lg border flex items-center justify-center mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-primary">
                        {String(item.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 text-lg h-14 shadow-xl shadow-primary/25"
                    onClick={() => setShowForm(true)}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Early Access
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-8 text-lg h-14"
                    onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    See Preview
                  </Button>
                </motion.div>
              </div>

              {/* Live Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <stat.icon className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold">
                        <AnimatedCounter value={stat.value} />
                        {stat.suffix}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Phone Mockup */}
            <motion.div 
              className="relative flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-green-500/30 blur-3xl scale-150" />
                
                {/* Floating CTA Arrow pointing to button */}
                <motion.div
                  className="absolute -left-20 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-medium shadow-lg whitespace-nowrap">
                    Try it out! 👆
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary rotate-45" />
                </motion.div>
                
                <PhoneScreen className="relative z-10 w-[280px] h-[560px] md:w-[320px] md:h-[640px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScreen}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <AppPreviewContent 
                        screenId={appScreens[currentScreen].id} 
                        onInteraction={() => {}} 
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
                        <div className="flex justify-around">
                          {[Home, Search, ShoppingCart, Heart, User].map((Icon, i) => (
                            <motion.div 
                              key={i} 
                              className={`p-2 rounded-full cursor-pointer ${i === 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary'}`}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setCurrentScreen(i % appScreens.length)}
                            >
                              <Icon className="w-5 h-5" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </PhoneScreen>

                {/* Interactive hint badge */}
                <motion.div
                  className="absolute -right-4 top-8 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1"
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Eye className="w-3 h-3" />
                  Interactive
                </motion.div>

                {/* Screen indicators */}
                <div className="flex gap-2 justify-center mt-6">
                  {appScreens.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setCurrentScreen(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentScreen ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {appScreens[currentScreen].title}
                </p>
                
                {/* CTA below phone */}
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <motion.p 
                    className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    Love what you see?
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="rounded-full px-6 shadow-lg shadow-primary/25"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Join Waitlist Now
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="relative z-10 py-12 bg-card/50 backdrop-blur-sm border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section id="preview" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Eye className="w-4 h-4" />
              Sneak Peek
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              A sneak peek inside
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've been building something special. Here's what you can expect.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {appScreens.map((screen, i) => (
              <motion.div
                key={screen.id}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <motion.div
                  className="bg-card rounded-3xl p-6 shadow-xl border cursor-pointer relative overflow-hidden"
                  whileHover={{ y: -10 }}
                >
                  {/* Interactive overlay on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-6 z-20"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-white font-semibold mb-3">Want to try this?</p>
                      <Button 
                        variant="secondary" 
                        className="rounded-full"
                        onClick={() => setShowForm(true)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Join Waitlist
                      </Button>
                    </motion.div>
                  </motion.div>
                  
                  <div className="aspect-[9/16] bg-muted rounded-2xl overflow-hidden mb-4 relative">
                    <div className="transform scale-90 origin-top">
                      <AppPreviewContent screenId={screen.id} onInteraction={() => {}} />
                    </div>
                    {/* Hover interaction hint */}
                    <motion.div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-foreground/80 text-background px-3 py-1 rounded-full text-xs flex items-center gap-1"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Hand className="w-3 h-3" />
                      Hover to explore
                    </motion.div>
                  </div>
                  <h3 className="font-semibold text-lg">{screen.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {i === 0 && "Browse hundreds of fresh products from local farms"}
                    {i === 1 && "Simple checkout with M-Pesa and card payments"}
                    {i === 2 && "Track your delivery in real-time"}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* CTA after preview cards */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex flex-col items-center gap-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-lg text-muted-foreground">
                Ready to experience fresh grocery shopping?
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="rounded-full px-8 shadow-xl shadow-primary/25"
                  onClick={() => setShowForm(true)}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Early Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Signup Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div 
                    key="form"
                    className="p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button 
                      onClick={() => setShowForm(false)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                    
                    <div className="text-center mb-6">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Gift className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h2 className="text-2xl font-bold">Join the Waitlist</h2>
                      <p className="text-muted-foreground mt-2">
                        Get 10% off your first order + free delivery
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Your Name *"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="col-span-2 px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary transition-all"
                        />
                        <input
                          type="email"
                          placeholder="Email Address *"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="col-span-2 px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary transition-all"
                        />
                        <input
                          type="tel"
                          placeholder="Phone (optional)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary transition-all"
                        />
                        <input
                          type="text"
                          placeholder="City/Town"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">What excites you most?</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Fresh produce", "Fast delivery", "Local farms", "Great prices"].map((interest) => (
                            <label
                              key={interest}
                              className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                                interests.includes(interest) 
                                  ? 'bg-primary/10 border-2 border-primary' 
                                  : 'bg-muted border-2 border-transparent'
                              }`}
                            >
                              <Checkbox
                                checked={interests.includes(interest)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setInterests([...interests, interest]);
                                  } else {
                                    setInterests(interests.filter((i) => i !== interest));
                                  }
                                }}
                                className="hidden"
                              />
                              <span className="text-sm">{interest}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 bg-muted rounded-xl cursor-pointer">
                          <Checkbox
                            checked={wantsEarlyAccess}
                            onCheckedChange={(checked) => setWantsEarlyAccess(checked as boolean)}
                          />
                          <span className="text-sm">I want early access to offers and discounts</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-muted rounded-xl cursor-pointer">
                          <Checkbox
                            checked={wantsBetaTesting}
                            onCheckedChange={(checked) => setWantsBetaTesting(checked as boolean)}
                          />
                          <span className="text-sm">I'd like to be a beta tester</span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl text-lg font-semibold"
                      >
                        {loading ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⏳
                          </motion.span>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Join the Waitlist
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        By joining, you agree to receive updates about The Food Basket. Unsubscribe anytime.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    className="p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">You're In! 🎉</h2>
                    <p className="text-muted-foreground mb-6">
                      Check your email for confirmation and your exclusive 10% discount code.
                    </p>
                    <div className="bg-muted p-4 rounded-xl mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Your position:</p>
                      <p className="text-3xl font-bold text-primary">#2,848</p>
                    </div>
                    <Button onClick={() => setShowForm(false)} className="w-full rounded-xl">
                      Close
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTA */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-primary to-green-600">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Don't miss the launch
          </motion.h2>
          <motion.p
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Join {2847}+ people already on the waitlist. Get exclusive early access, discounts, and more.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 rounded-full px-10 h-14 text-lg font-semibold shadow-xl"
              onClick={() => setShowForm(true)}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Join the Waitlist
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 bg-background border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBasket className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">The Food Basket</span>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <motion.a 
              href="https://www.facebook.com/profile.php?id=61583525641483" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
              </svg>
            </motion.a>
            <motion.a 
              href="https://www.instagram.com/thefoodbasket.co.ke/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
              </svg>
            </motion.a>
            <motion.a 
              href="https://www.tiktok.com/@_thefoodbasket?is_from_webapp=1&sender_device=pc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"></path>
              </svg>
            </motion.a>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">Follow us for updates & exclusive offers</p>
          <p className="text-sm text-muted-foreground">
            © 2025 The Food Basket. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;
