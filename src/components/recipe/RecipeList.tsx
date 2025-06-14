
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe) => void;
}

const RecipeList = ({ recipes, selectedRecipe, onSelectRecipe }: RecipeListProps) => {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Generated Recipes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recipes.map((recipe) => (
          <Button
            key={recipe.id}
            variant={selectedRecipe?.id === recipe.id ? "default" : "outline"}
            className="w-full justify-start h-auto py-3 px-3"
            onClick={() => onSelectRecipe(recipe)}
          >
            <div className="text-left">
              <div className="font-medium">{recipe.title}</div>
              <div className="text-xs text-muted-foreground">
                {recipe.cookingTime} • {recipe.difficulty}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecipeList;
