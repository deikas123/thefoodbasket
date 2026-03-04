
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
  return (
    <div className="flex gap-2">
      {activeTab === "ai-generated" && (
        <Button 
          onClick={onGenerateAIBaskets} 
          disabled={isGeneratingBaskets}
          size="sm"
          className="rounded-full text-xs bg-[hsl(var(--rally-navy))] hover:bg-[hsl(var(--rally-navy)/0.9)]"
        >
          {isGeneratingBaskets ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isGeneratingBaskets ? "Generating..." : "Generate"}
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onToggleSort} className="rounded-full text-xs">
        <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
        {sort === "price_asc" ? "Low → High" : "High → Low"}
      </Button>
    </div>
  );
};

export default FoodBasketActions;
