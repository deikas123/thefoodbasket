
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBasket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  activeTab: string;
  onGenerateAIBaskets: () => void;
  onSwitchTab: (tab: string) => void;
  isGenerating: boolean;
}

const EmptyState = ({ activeTab, onGenerateAIBaskets, onSwitchTab, isGenerating }: EmptyStateProps) => {
  const getContent = () => {
    switch (activeTab) {
      case "all":
        return {
          title: "No Baskets Yet",
          description: "No pre-made food baskets available. Try our AI-generated ones!",
          action: (
            <Button onClick={() => onSwitchTab("ai-generated")} className="rounded-full bg-[hsl(var(--rally-navy))] hover:bg-[hsl(var(--rally-navy)/0.9)]">
              <Sparkles className="mr-2 h-4 w-4" /> Try AI Baskets
            </Button>
          )
        };
      case "personalized":
        return {
          title: "No Saved Baskets",
          description: "Save AI-generated baskets to see them here.",
          action: (
            <Button onClick={() => onSwitchTab("ai-generated")} className="rounded-full bg-[hsl(var(--rally-navy))] hover:bg-[hsl(var(--rally-navy)/0.9)]">
              <ArrowRight className="mr-2 h-4 w-4" /> Browse AI Baskets
            </Button>
          )
        };
      case "ai-generated":
        return {
          title: "Generate Smart Baskets",
          description: "Our AI creates balanced meal baskets using only in-stock products.",
          action: (
            <Button 
              onClick={onGenerateAIBaskets} 
              disabled={isGenerating}
              className="rounded-full bg-[hsl(var(--rally-navy))] hover:bg-[hsl(var(--rally-navy)/0.9)]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Baskets"}
            </Button>
          )
        };
      default:
        return { title: "Nothing Here", description: "Check back later.", action: null };
    }
  };

  const content = getContent();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 sm:py-20"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
        <ShoppingBasket className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{content.title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">{content.description}</p>
      {content.action}
    </motion.div>
  );
};

export default EmptyState;
