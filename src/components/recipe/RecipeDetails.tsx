
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface RecipeDetailsProps {
  recipe: Recipe | null;
}

const RecipeDetails = ({ recipe }: RecipeDetailsProps) => {
  if (!recipe) {
    return null;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>{recipe.description}</CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{recipe.difficulty}</Badge>
          <Badge variant="secondary">{recipe.cookingTime}</Badge>
          <Badge variant="secondary">Serves {recipe.servings}</Badge>
          <Badge variant="outline">{recipe.cuisine}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-muted-foreground">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-3">Instructions</h3>
          <ol className="space-y-3">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeDetails;
