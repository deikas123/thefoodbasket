import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginFormData } from "@/types";
import { Mail, Lock, ShoppingBasket, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || "/";
  const registrationSuccess = location.state?.registrationSuccess;
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Show success message if coming from registration
  useEffect(() => {
    if (registrationSuccess) {
      toast.success("Welcome to The Food Basket!", {
        description: "Please sign in with your new account credentials.",
      });
    }
  }, [registrationSuccess]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!", { description: "You've successfully signed in." });
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Floating food items for background
  const floatingItems = ["🥕", "🍎", "🥬", "🍊", "🥑", "🍋", "🌽", "🥦"];
  
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: -50 
            }}
            animate={{ 
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
              rotate: 360,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
            }}
            transition={{ 
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      {/* Left Panel - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10">
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <ShoppingBasket className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">The Food Basket</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Fresh Groceries,<br />
            <span className="text-white/80">Delivered to Your Door</span>
          </motion.h1>
          
          <motion.p 
            className="text-white/80 text-lg max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Shop from Nairobi's best stores with same-day delivery. Fresh produce, quality products, and unbeatable convenience.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div 
          className="relative z-10 grid grid-cols-3 gap-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { value: "10K+", label: "Happy Customers" },
            { value: "500+", label: "Products" },
            { value: "30min", label: "Avg Delivery" }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Decorative Elements */}
        <motion.div 
          className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-20 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div 
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBasket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">The Food Basket</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground">
                Sign in to continue shopping for fresh groceries
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm flex items-center gap-2"
                >
                  <span className="text-lg">⚠️</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold group relative overflow-hidden"
                  disabled={isLoading || isSubmitting}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading || isSubmitting ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                  Create one now
                  <Sparkles className="w-4 h-4" />
                </Link>
              </p>
            </motion.div>

            {/* Back to Home */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
