import { Construction, Mail, Clock, Settings, Wrench, RefreshCw, Twitter, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MaintenancePage = () => {
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("We'll notify you when we're back!");
      setEmail("");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const floatingIcons = [
    { Icon: Settings, delay: 0, x: "10%", y: "20%" },
    { Icon: Wrench, delay: 0.5, x: "85%", y: "15%" },
    { Icon: RefreshCw, delay: 1, x: "15%", y: "75%" },
    { Icon: Settings, delay: 1.5, x: "80%", y: "80%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-orange-200/30 to-amber-200/30 blur-3xl"
          animate={{
            x: ["-25%", "25%", "-25%"],
            y: ["-25%", "25%", "-25%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, idx) => (
        <motion.div
          key={idx}
          className="absolute text-orange-300/40 dark:text-orange-700/30"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -20, 0],
            rotate: [0, 360]
          }}
          transition={{
            opacity: { delay, duration: 0.5 },
            scale: { delay, duration: 0.5 },
            y: { delay: delay + 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { delay: delay + 0.5, duration: 20, repeat: Infinity, ease: "linear" }
          }}
        >
          <Icon className="w-12 h-12" />
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div 
        className="max-w-lg w-full text-center space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Icon */}
        <motion.div 
          className="flex justify-center"
          variants={itemVariants}
        >
          <div className="relative">
            <motion.div 
              className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shadow-2xl"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(251, 146, 60, 0.4)",
                  "0 0 0 20px rgba(251, 146, 60, 0)",
                  "0 0 0 0 rgba(251, 146, 60, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Construction className="w-16 h-16 text-orange-600 dark:text-orange-400" />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Clock className="w-5 h-5 text-white" />
            </motion.div>
            
            {/* Orbiting dots */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-orange-400"
                style={{ top: "50%", left: "50%" }}
                animate={{
                  x: [0, 80 * Math.cos((i * 2 * Math.PI) / 3), 0],
                  y: [0, 80 * Math.sin((i * 2 * Math.PI) / 3), 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
            We're Under Maintenance
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            We're making some improvements to serve you better. 
            We'll be back shortly with an even better experience!
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div 
          className="bg-background/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-2xl"
          variants={itemVariants}
        >
          <p className="text-sm text-muted-foreground mb-4">Estimated time remaining</p>
          <div className="flex justify-center gap-4">
            {[
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
              >
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <motion.span 
                    className="text-3xl font-bold text-white"
                    key={item.value}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {String(item.value).padStart(2, "0")}
                  </motion.span>
                </motion.div>
                <span className="text-xs text-muted-foreground mt-2 block">{item.label}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: "65%" }}
                transition={{ duration: 2, delay: 1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Progress: 65% complete</p>
          </div>
        </motion.div>

        {/* Notification form */}
        <motion.form 
          onSubmit={handleNotify} 
          className="space-y-4"
          variants={itemVariants}
        >
          <p className="text-sm text-muted-foreground">
            Get notified when we're back online
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <motion.div 
              className="flex-1"
              whileFocus={{ scale: 1.02 }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full px-5 h-12 border-2 focus:border-orange-400 transition-colors"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button type="submit" className="rounded-full px-6 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg">
                <Mail className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </motion.div>
          </div>
        </motion.form>

        {/* Social links */}
        <motion.div 
          className="space-y-4"
          variants={itemVariants}
        >
          <p className="text-sm text-muted-foreground">
            Follow us for updates
          </p>
          <div className="flex justify-center gap-4">
            {[
              { Icon: Twitter, color: "hover:text-blue-400", bg: "hover:bg-blue-50" },
              { Icon: Facebook, color: "hover:text-blue-600", bg: "hover:bg-blue-50" },
              { Icon: Instagram, color: "hover:text-pink-500", bg: "hover:bg-pink-50" },
            ].map(({ Icon, color, bg }, idx) => (
              <motion.button
                key={idx}
                className={`w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground ${color} ${bg} transition-colors shadow-md`}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + idx * 0.1 }}
              >
                <Icon className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Status updates */}
        <motion.div 
          className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-4 border border-green-200 dark:border-green-900"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              All systems operational • Database migration in progress
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;