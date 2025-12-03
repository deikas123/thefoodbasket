import { Construction, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const MaintenancePage = () => {
  const [email, setEmail] = useState("");

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("We'll notify you when we're back!");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Construction className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center animate-pulse">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            We're Under Maintenance
          </h1>
          <p className="text-muted-foreground text-lg">
            We're making some improvements to serve you better. 
            We'll be back shortly!
          </p>
        </div>

        {/* Estimated time */}
        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
          <p className="text-sm text-muted-foreground mb-2">Estimated downtime</p>
          <p className="text-2xl font-bold text-primary">~2 hours</p>
        </div>

        {/* Notification form */}
        <form onSubmit={handleNotify} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get notified when we're back online
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-4"
            />
            <Button type="submit" className="rounded-full px-6">
              <Mail className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </div>
        </form>

        {/* Social links */}
        <p className="text-sm text-muted-foreground">
          Follow us for updates on our social channels
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
