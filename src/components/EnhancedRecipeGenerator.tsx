
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { toast } from "@/hooks/use-toast";
import RecipeHeader from "@/components/recipe/RecipeHeader";
import IngredientSelector from "@/components/recipe/IngredientSelector";
import GenerateButton from "@/components/recipe/GenerateButton";
import RecipeList from "@/components/recipe/RecipeList";
import RecipeDetails from "@/components/recipe/RecipeDetails";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
}

const EnhancedRecipeGenerator = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<Product[]>([]);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState("cart");

  const handleProductSelection = (product: Product, isSelected: boolean) => {
    setSelectedIngredients(prev => 
      isSelected 
        ? [...prev, product]
        : prev.filter(p => p.id !== product.id)
    );
  };

  const addCustomIngredient = (ingredient: string) => {
    setCustomIngredients(prev => [...prev, ingredient]);
  };

  const removeCustomIngredient = (ingredient: string) => {
    setCustomIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const generateRecipes = async () => {
    if (selectedIngredients.length === 0 && customIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select some ingredients to generate recipes.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI recipe generation
    setTimeout(() => {
      const allIngredients = [
        ...selectedIngredients.map(p => p.name),
        ...customIngredients
      ];
      
      const recipes = generateMockRecipes(allIngredients);
      setGeneratedRecipes(recipes);
      setSelectedRecipe(recipes[0]);
      setIsGenerating(false);
      
      toast({
        title: "Recipes generated!",
        description: `Generated ${recipes.length} recipes using your ingredients.`
      });
    }, 2000);
  };

  const generateMockRecipes = (ingredients: string[]): Recipe[] => {
    const baseRecipes = [
      {
        id: '1',
        title: `${ingredients[0]} Stir Fry`,
        description: `A delicious stir fry featuring ${ingredients.slice(0, 3).join(', ')}`,
        cookingTime: '25 minutes',
        servings: 4,
        difficulty: 'Easy' as const,
        cuisine: 'Asian Fusion'
      },
      {
        id: '2',
        title: `Hearty ${ingredients[0]} Soup`,
        description: `Warming soup with fresh ${ingredients.slice(0, 2).join(' and ')}`,
        cookingTime: '40 minutes',
        servings: 6,
        difficulty: 'Medium' as const,
        cuisine: 'Comfort Food'
      },
      {
        id: '3',
        title: `${ingredients[0]} Salad Bowl`,
        description: `Fresh and healthy salad with ${ingredients.slice(0, 4).join(', ')}`,
        cookingTime: '15 minutes',
        servings: 2,
        difficulty: 'Easy' as const,
        cuisine: 'Mediterranean'
      }
    ];

    return baseRecipes.map(recipe => ({
      ...recipe,
      ingredients: ingredients.slice(0, Math.min(8, ingredients.length)),
      instructions: [
        'Prepare all ingredients by washing and chopping as needed',
        'Heat cooking oil in a large pan or pot',
        'Add main ingredients and cook according to recipe type',
        'Season with salt, pepper, and herbs to taste',
        'Cook until tender and heated through',
        'Serve hot and enjoy!'
      ]
    }));
  };

  const hasIngredients = selectedIngredients.length > 0 || customIngredients.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <RecipeHeader />

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <IngredientSelector
            selectedIngredients={selectedIngredients}
            customIngredients={customIngredients}
            onProductSelection={handleProductSelection}
            onAddCustomIngredient={addCustomIngredient}
            onRemoveCustomIngredient={removeCustomIngredient}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {hasIngredients && (
            <div className="mt-6 p-4 bg-accent/20 rounded-lg">
              <h3 className="font-medium mb-3">Selected Ingredients:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedIngredients.map((product) => (
                  <Badge key={product.id} variant="default">
                    {product.name}
                  </Badge>
                ))}
                {customIngredients.map((ingredient) => (
                  <Badge key={ingredient} variant="default">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <GenerateButton 
            onGenerate={generateRecipes}
            isGenerating={isGenerating}
            hasIngredients={hasIngredients}
          />
        </CardContent>
      </Card>

      {generatedRecipes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecipeList 
            recipes={generatedRecipes}
            selectedRecipe={selectedRecipe}
            onSelectRecipe={setSelectedRecipe}
          />
          <RecipeDetails recipe={selectedRecipe} />
        </div>
      )}
    </div>
  );
};

export default EnhancedRecipeGenerator;
