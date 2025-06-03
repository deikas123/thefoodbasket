
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Wand2 } from "lucide-react";

interface EmptyStateProps {
  activeTab: string;
  onGenerateAIBaskets?: () => void;
  onSwitchTab?: (tab: string) => void;
  isGenerating?: boolean;
}

const EmptyState = ({ 
  activeTab, 
  onGenerateAIBaskets, 
  onSwitchTab, 
  isGenerating 
}: EmptyStateProps) => {
  if (activeTab === "personalized") {
    return (
      <div className="text-center py-12 px-4">
        <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg sm:text-xl font-medium mb-2">No personalized baskets yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
          To receive personalized basket suggestions, please make some purchases or update your dietary preferences in your profile.
        </p>
        <Button onClick={() => onSwitchTab?.("all")}>Browse All Baskets</Button>
      </div>
    );
  }

  if (activeTab === "ai-generated") {
    return (
      <div className="text-center py-12 px-4">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg sm:text-xl font-medium mb-2">No AI baskets generated yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
          Click the "Generate AI Baskets" button to create smart food baskets based on available products and intelligent meal planning.
        </p>
        <Button onClick={onGenerateAIBaskets} disabled={isGenerating}>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Smart Baskets
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <h3 className="text-lg sm:text-xl font-medium mb-2">No baskets found</h3>
      <p className="text-muted-foreground mb-6 text-sm sm:text-base">
        We couldn't find any food baskets. Please check back later.
      </p>
    </div>
  );
};

export default EmptyState;
