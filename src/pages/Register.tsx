import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterFormData } from "@/types";
import { Mail, Lock, User, ShoppingBasket, ArrowRight, Check, Gift } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (formData: RegisterFormData) => {
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await registerUser(formData);
      toast.success("Account created successfully!", {
        description: "Please sign in to start shopping.",
      });
      navigate("/login", { state: { registrationSuccess: true } });
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "Free delivery on first order",
    "Earn loyalty points on every purchase",
    "Exclusive member-only deals",
    "Early access to flash sales",
  ];

  // Floating food items for background
  const floatingItems = ["🥬", "🍅", "🥒", "🍇", "🥭", "🍓", "🥕", "🍊"];
  
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-15"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50
            }}
            animate={{ 
              y: -100,
              rotate: -360,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
            }}
            transition={{ 
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2.5,
              ease: "linear"
            }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      {/* Left Panel - Form */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-6 lg:p-12 order-2 lg:order-1"
        initial={{ x: -100, opacity: 0 }}
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
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Gift className="w-4 h-4" />
                Free delivery on first order!
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
              <p className="text-muted-foreground">
                Join thousands of happy shoppers getting fresh groceries delivered
              </p>
            </div>

            {/* Progress Steps */}
            <motion.div 
              className="flex items-center justify-center gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step >= s 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}
                    animate={step >= s ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </motion.div>
                  {s < 2 && (
                    <div className={`w-12 h-1 rounded-full transition-colors ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </motion.div>

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

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            {...form.register("firstName", { required: true })}
                            id="firstName"
                            placeholder="John"
                            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            {...form.register("lastName", { required: true })}
                            id="lastName"
                            placeholder="Doe"
                            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          {...form.register("email", { required: true })}
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="button"
                      onClick={() => {
                        const values = form.getValues();
                        if (values.firstName && values.lastName && values.email) {
                          setStep(2);
                          setError(null);
                        } else {
                          setError("Please fill in all fields");
                        }
                      }}
                      className="w-full h-12 rounded-xl text-base font-semibold group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Continue
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          {...form.register("password", { required: true, minLength: 8 })}
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                          required
                          minLength={8}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground pl-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          {...form.register("confirmPassword", { required: true })}
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="h-12 rounded-xl px-6"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-12 rounded-xl text-base font-semibold group relative overflow-hidden"
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
                              Creating...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
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

      {/* Right Panel - Benefits */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-bl from-secondary via-secondary/90 to-secondary/80 dark:from-secondary/80 dark:via-secondary/70 dark:to-secondary/60 p-12 flex-col justify-between relative overflow-hidden order-1 lg:order-2"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10">
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-14 h-14 bg-foreground/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <ShoppingBasket className="w-8 h-8 text-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">The Food Basket</span>
          </motion.div>

          <motion.h2 
            className="text-4xl font-bold text-foreground mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Why Join Us?
          </motion.h2>

          <motion.div 
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-4 p-4 bg-foreground/5 backdrop-blur-sm rounded-xl"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div 
          className="relative z-10 p-6 bg-foreground/10 backdrop-blur-sm rounded-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xl">
              👩
            </div>
            <div>
              <p className="text-foreground/90 italic mb-2">
                "Best grocery delivery in Nairobi! Fresh produce and amazing prices."
              </p>
              <p className="text-foreground font-semibold text-sm">Sarah M.</p>
              <p className="text-foreground/60 text-sm">Nairobi Customer</p>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div 
          className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </motion.div>
    </div>
  );
};

export default Register;
