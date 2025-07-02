
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingCart, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  activeTab: string;
  onGenerateAIBaskets: () => void;
  onSwitchTab: (tab: string) => void;
  isGenerating: boolean;
}

const EmptyState = ({ activeTab, onGenerateAIBaskets, onSwitchTab, isGenerating }: EmptyStateProps) => {
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "all":
        return {
          icon: <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
          title: "No Food Baskets Available",
          description: "There are currently no pre-made food baskets available. Try generating AI baskets or check back later.",
          action: (
            <Button onClick={() => onSwitchTab("ai-generated")} className="mt-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Try AI Generated Baskets
            </Button>
          )
        };
      
      case "personalized":
        return {
          icon: <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
          title: "No Personalized Baskets Yet",
          description: "We're working on creating personalized baskets based on your preferences. Try our AI-generated baskets in the meantime.",
          action: (
            <Button onClick={() => onSwitchTab("ai-generated")} className="mt-4">
              <ArrowRight className="mr-2 h-4 w-4" />
              Try AI Generated
            </Button>
          )
        };
      
      case "ai-generated":
        return {
          icon: <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
          title: "No AI baskets generated yet",
          description: "Click the 'Generate AI Baskets' button to create smart food baskets based on available products and intelligent meal planning.",
          action: (
            <Button 
              onClick={onGenerateAIBaskets} 
              disabled={isGenerating}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Smart Baskets"}
            </Button>
          )
        };
      
      default:
        return {
          icon: <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
          title: "No Items Found",
          description: "No items available in this category at the moment.",
          action: null
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="text-center py-12">
      {content.icon}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {content.description}
      </p>
      {activeTab === "ai-generated" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-4">
          <p className="text-sm text-green-800">
            <strong>Smart Generation:</strong> Our AI only uses products currently in stock, 
            ensuring you can order everything in your basket right away!
          </p>
        </div>
      )}
      {content.action}
    </div>
  );
};

export default EmptyState;
