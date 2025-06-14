
import { ChefHat } from "lucide-react";

const RecipeHeader = () => {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ChefHat className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Enhanced Recipe Generator</h1>
      </div>
      <p className="text-muted-foreground">
        Generate personalized recipes using ingredients from your cart, wishlist, or add your own
      </p>
    </div>
  );
};

export default RecipeHeader;
