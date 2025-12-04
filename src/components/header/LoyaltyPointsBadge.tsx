import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type LoyaltyTier = 'bronze' | 'silver' | 'gold';

const tierConfig: Record<LoyaltyTier, { label: string; color: string; bgColor: string }> = {
  bronze: { 
    label: 'Bronze', 
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  silver: { 
    label: 'Silver', 
    color: 'text-slate-500 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50'
  },
  gold: { 
    label: 'Gold', 
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
};

const LoyaltyPointsBadge = () => {
  const { user } = useAuth();
  const { data: settings } = useLoyaltySettings();

  const { data: profile } = useQuery({
    queryKey: ['user-loyalty-points', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (!user || !profile) return null;

  const points = profile.loyalty_points || 0;
  
  const getTier = (): LoyaltyTier => {
    if (!settings) return 'bronze';
    if (points >= settings.gold_threshold) return 'gold';
    if (points >= settings.silver_threshold) return 'silver';
    return 'bronze';
  };

  const tier = getTier();
  const config = tierConfig[tier];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to="/loyalty" 
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors",
              config.bgColor,
              "hover:opacity-80"
            )}
          >
            <Award className={cn("h-4 w-4", config.color)} />
            <span className={cn("text-sm font-medium", config.color)}>
              {points.toLocaleString()}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label} Member</p>
          <p className="text-xs text-muted-foreground">{points.toLocaleString()} points</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LoyaltyPointsBadge;
