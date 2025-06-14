
import { Button } from "@/components/ui/button";
import { ChefHat, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  hasIngredients: boolean;
}

const GenerateButton = ({ onGenerate, isGenerating, hasIngredients }: GenerateButtonProps) => {
  return (
    <div className="mt-6">
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating || !hasIngredients}
        className="w-full h-12"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Recipes...
          </>
        ) : (
          <>
            <ChefHat className="mr-2 h-4 w-4" />
            Generate Recipes
          </>
        )}
      </Button>
    </div>
  );
};

export default GenerateButton;
