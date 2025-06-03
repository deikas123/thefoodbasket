
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2, Wand2 } from "lucide-react";

interface FoodBasketActionsProps {
  activeTab: string;
  sort: "price_asc" | "price_desc";
  isGeneratingBaskets: boolean;
  onToggleSort: () => void;
  onGenerateAIBaskets: () => void;
}

const FoodBasketActions = ({
  activeTab,
  sort,
  isGeneratingBaskets,
  onToggleSort,
  onGenerateAIBaskets
}: FoodBasketActionsProps) => {
  if (!["all", "personalized", "ai-generated"].includes(activeTab)) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      {activeTab === "ai-generated" && (
        <Button 
          onClick={onGenerateAIBaskets} 
          disabled={isGeneratingBaskets}
          className="flex items-center gap-2 text-xs sm:text-sm"
          size="sm"
        >
          {isGeneratingBaskets ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Wand2 className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          {isGeneratingBaskets ? "Generating..." : "Generate AI Baskets"}
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onToggleSort} className="text-xs sm:text-sm">
        <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Price: {sort === "price_asc" ? "Low to High" : "High to Low"}</span>
        <span className="sm:hidden">{sort === "price_asc" ? "↑" : "↓"}</span>
      </Button>
    </div>
  );
};

export default FoodBasketActions;
