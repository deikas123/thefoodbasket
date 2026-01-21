import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Repeat, Check } from "lucide-react";
import { AutoReplenishDialog } from "./AutoReplenishDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface AutoReplenishButtonProps {
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  variant?: "default" | "compact" | "full";
  className?: string;
}

const AutoReplenishButton = ({ 
  productId, 
  productName,
  productImage,
  productPrice,
  variant = "default",
  className = ""
}: AutoReplenishButtonProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Check if user already has this product in auto-replenish
  const { data: existingItem } = useQuery({
    queryKey: ['auto-replenish-status', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('auto_replenish_items')
        .select('id, active, frequency_days, quantity')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const isSubscribed = existingItem?.active;

  if (variant === "compact") {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className={`p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors ${className}`}
          title={isSubscribed ? "Manage subscription" : "Set up auto-replenish"}
        >
          <Repeat className={`h-4 w-4 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
        </motion.button>
        
        <AutoReplenishDialog
          open={open}
          onOpenChange={setOpen}
          productId={productId}
          productName={productName}
          productImage={productImage}
          productPrice={productPrice}
        />
      </>
    );
  }

  if (variant === "full") {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all ${
            isSubscribed 
              ? 'border-primary/50 bg-primary/5' 
              : 'border-border hover:border-primary/30 hover:bg-muted/50'
          } ${className}`}
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isSubscribed ? 'bg-primary/20' : 'bg-muted'}`}>
              <Repeat className={`h-5 w-5 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Auto-Replenish</p>
                {isSubscribed && (
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? `Delivers ${existingItem.quantity} every ${existingItem.frequency_days} days`
                  : 'Never run out - schedule automatic deliveries'}
              </p>
            </div>
            <Button variant={isSubscribed ? "outline" : "default"} size="sm">
              {isSubscribed ? "Manage" : "Set Up"}
            </Button>
          </div>
        </motion.div>
        
        <AutoReplenishDialog
          open={open}
          onOpenChange={setOpen}
          productId={productId}
          productName={productName}
          productImage={productImage}
          productPrice={productPrice}
        />
      </>
    );
  }

  return (
    <>
      <Button 
        variant={isSubscribed ? "secondary" : "outline"}
        onClick={() => setOpen(true)}
        className={`flex-1 ${className}`}
      >
        <Repeat className={`h-4 w-4 mr-2 ${isSubscribed ? 'text-primary' : ''}`} />
        {isSubscribed ? "Subscribed" : "Auto-Replenish"}
      </Button>
      
      <AutoReplenishDialog
        open={open}
        onOpenChange={setOpen}
        productId={productId}
        productName={productName}
        productImage={productImage}
        productPrice={productPrice}
      />
    </>
  );
};

export default AutoReplenishButton;
