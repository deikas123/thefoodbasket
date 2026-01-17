import { useState, useEffect } from "react";
import { Sparkles, Gift, Clock, ArrowRight, Star, Zap, Truck, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PromoPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 52,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds =
          prev.days * 86400 +
          prev.hours * 3600 +
          prev.minutes * 60 +
          prev.seconds -
          1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          days: Math.floor(totalSeconds / 86400),
          hours: Math.floor((totalSeconds % 86400) / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("You're subscribed! Check your email for exclusive offers.");
      setEmail("");
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const products = [
    { name: "Fresh Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop", discount: "30%", originalPrice: 500, salePrice: 350 },
    { name: "Organic Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=300&fit=crop", discount: "25%", originalPrice: 800, salePrice: 600 },
    { name: "Dairy Products", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=300&fit=crop", discount: "20%", originalPrice: 450, salePrice: 360 },
    { name: "Fresh Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop", discount: "15%", originalPrice: 300, salePrice: 255 },
  ];

  const features = [
    { icon: Clock, title: "Same Day Delivery", description: "Order before 2 PM for same-day delivery", color: "from-blue-500 to-cyan-500" },
    { icon: Star, title: "Premium Quality", description: "Hand-picked fresh products from trusted sources", color: "from-yellow-500 to-orange-500" },
    { icon: Gift, title: "Loyalty Rewards", description: "Earn points on every purchase", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-300/30 to-emerald-300/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-300/30 to-cyan-300/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-primary/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20 relative">
        <motion.div 
          className="max-w-4xl mx-auto text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-green-400/20 text-primary px-5 py-2.5 rounded-full text-sm font-semibold border border-primary/20 shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 10px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.span>
              Limited Time Offer
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-yellow-500" />
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-foreground leading-tight"
            variants={itemVariants}
          >
            Get{" "}
            <motion.span 
              className="relative inline-block"
              whileHover={{ scale: 1.1 }}
            >
              <span className="bg-gradient-to-r from-primary via-green-400 to-emerald-500 bg-clip-text text-transparent">
                50% OFF
              </span>
              <motion.span
                className="absolute -inset-2 bg-primary/10 rounded-lg -z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.span>
            <br />
            Your First Order
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Fresh groceries delivered to your doorstep. Sign up now and enjoy 
            exclusive discounts on premium quality products.
          </motion.p>

          {/* Countdown Timer */}
          <motion.div 
            className="flex justify-center gap-3 md:gap-4"
            variants={itemVariants}
          >
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                className="text-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, type: "spring", stiffness: 200 }}
              >
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-background shadow-xl flex items-center justify-center border-2 border-primary/20 relative overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"
                    animate={{ y: ["100%", "0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  />
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={item.value}
                      className="text-2xl md:text-3xl font-bold text-primary relative z-10"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {String(item.value).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
                <span className="text-xs text-muted-foreground mt-2 block font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Email Subscription */}
          <motion.form 
            onSubmit={handleSubscribe} 
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            variants={itemVariants}
          >
            <motion.div 
              className="flex-1 relative"
              whileFocus={{ scale: 1.02 }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full px-6 h-14 border-2 focus:border-primary transition-all shadow-lg"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                className="rounded-full px-8 h-14 gap-2 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 shadow-lg text-base font-semibold"
              >
                <Gift className="w-5 h-5" />
                Get Offer
              </Button>
            </motion.div>
          </motion.form>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="rounded-full gap-2 px-8 h-12 border-2 hover:bg-primary hover:text-white transition-all shadow-md"
                onClick={() => navigate('/shop')}
              >
                Browse Products
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="pt-8"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 mx-auto text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div 
        className="bg-background/60 backdrop-blur-xl py-16 border-y border-border/50 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-start gap-4 p-6 rounded-3xl bg-background border border-border/50 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:border-primary/20">
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Product Preview */}
      <div className="container mx-auto px-4 py-16 relative">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Products</h2>
          <p className="text-muted-foreground text-lg">Check out our top sellers with amazing discounts</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, idx) => (
            <motion.div 
              key={idx} 
              className="relative rounded-3xl overflow-hidden bg-background border border-border/50 group cursor-pointer shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => navigate('/shop')}
            >
              <motion.div
                className="absolute top-3 left-3 z-10"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
              >
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1 text-sm font-bold">
                  {product.discount} OFF
                </Badge>
              </motion.div>
              
              <div className="relative overflow-hidden">
                <motion.img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4"
                >
                  <Button size="sm" className="rounded-full gap-2">
                    <Truck className="w-4 h-4" />
                    Quick Add
                  </Button>
                </motion.div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-primary">KES {product.salePrice}</span>
                  <span className="text-sm text-muted-foreground line-through">KES {product.originalPrice}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="rounded-full gap-2 px-10 bg-gradient-to-r from-primary to-green-500 shadow-lg"
              onClick={() => navigate('/shop')}
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <motion.div 
        className="py-12 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { icon: Shield, text: "Secure Payments" },
              { icon: Truck, text: "Fast Delivery" },
              { icon: Star, text: "Quality Guaranteed" },
              { icon: Gift, text: "Easy Returns" },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                className="flex items-center gap-2 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, color: "var(--primary)" }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PromoPage;