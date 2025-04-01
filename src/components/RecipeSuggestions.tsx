
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useCart } from "@/context/CartContext";
import { Loader2, ChefHat, ShoppingBag, Utensils, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RecipeSuggestionsProps {
  cartItems?: Product[];
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image: string;
  preparationTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

const RecipeSuggestions = ({ cartItems }: RecipeSuggestionsProps) => {
  const { items } = useCart();
  const productsInCart = cartItems || items.map(item => item.product);
  
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // This would be connected to an AI service in production
  const generateRecipes = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Generate mock recipes based on cart items
      const productNames = productsInCart.map(product => product.name.toLowerCase());
      const hasVegetables = productNames.some(name => 
        name.includes('spinach') || name.includes('pepper') || name.includes('carrot') || 
        name.includes('tomato') || name.includes('broccoli') || name.includes('onion')
      );
      
      const hasFruits = productNames.some(name => 
        name.includes('apple') || name.includes('banana') || name.includes('orange') || 
        name.includes('strawberry') || name.includes('blueberry') || name.includes('avocado')
      );
      
      const hasMeat = productNames.some(name => 
        name.includes('beef') || name.includes('chicken') || name.includes('pork') || name.includes('meat')
      );
      
      const hasDairy = productNames.some(name => 
        name.includes('cheese') || name.includes('milk') || name.includes('yogurt') || name.includes('butter')
      );
      
      // Generate appropriate recipes based on cart contents
      const generatedRecipes: Recipe[] = [];
      
      if (hasVegetables && hasMeat) {
        generatedRecipes.push({
          id: '1',
          title: 'Hearty Vegetable Stir Fry',
          description: 'A delicious and quick stir fry using fresh vegetables and your choice of meat.',
          ingredients: [
            '1 lb mixed vegetables (bell peppers, broccoli, carrots)',
            '1/2 lb meat (beef or chicken, sliced thin)',
            '2 tbsp cooking oil',
            '3 tbsp stir fry sauce',
            '1 tsp ginger, minced',
            '2 cloves garlic, minced'
          ],
          instructions: [
            'Heat oil in a large pan or wok over high heat.',
            'Add meat and stir fry until nearly cooked through, about 2-3 minutes.',
            'Add vegetables and continue to stir fry for 3-4 minutes until tender-crisp.',
            'Add garlic and ginger, cook for 30 seconds.',
            'Pour sauce over and stir to coat everything evenly.',
            'Serve hot over rice or noodles.'
          ],
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop',
          preparationTime: '25 mins',
          difficulty: 'Easy',
          tags: ['Dinner', 'Quick', 'Protein-Rich']
        });
      }
      
      if (hasFruits && hasDairy) {
        generatedRecipes.push({
          id: '2',
          title: 'Creamy Fruit Smoothie Bowl',
          description: 'A nutritious and refreshing smoothie bowl topped with fresh fruits and nuts.',
          ingredients: [
            '1 banana',
            '1 cup mixed berries (strawberries, blueberries)',
            '1/2 cup Greek yogurt',
            '1/4 cup milk',
            'Toppings: sliced fruits, granola, honey'
          ],
          instructions: [
            'Combine banana, berries, yogurt, and milk in a blender.',
            'Blend until smooth and creamy.',
            'Pour into a bowl.',
            'Top with additional fresh fruits, granola, and a drizzle of honey.',
            'Serve immediately.'
          ],
          image: 'https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?q=80&w=1964&auto=format&fit=crop',
          preparationTime: '10 mins',
          difficulty: 'Easy',
          tags: ['Breakfast', 'Healthy', 'No-Cook']
        });
      }
      
      if (hasVegetables && !hasMeat) {
        generatedRecipes.push({
          id: '3',
          title: 'Fresh Garden Salad',
          description: 'A light and refreshing salad using fresh vegetables from your cart.',
          ingredients: [
            'Mixed salad greens',
            'Assorted vegetables (tomatoes, cucumbers, bell peppers, carrots)',
            '1/4 cup nuts or seeds',
            '1/4 cup vinaigrette dressing',
            'Salt and pepper to taste'
          ],
          instructions: [
            'Wash and dry all vegetables.',
            'Cut vegetables into bite-sized pieces.',
            'Combine all ingredients in a large bowl.',
            'Drizzle with dressing and toss to coat.',
            'Season with salt and pepper.',
            'Serve immediately.'
          ],
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
          preparationTime: '15 mins',
          difficulty: 'Easy',
          tags: ['Salad', 'Vegan', 'Healthy']
        });
      }
      
      // Fallback recipe if no specific ingredients are detected
      if (generatedRecipes.length === 0) {
        generatedRecipes.push({
          id: '4',
          title: 'Simple Pantry Pasta',
          description: 'A versatile pasta dish that can be made with what you have on hand.',
          ingredients: [
            '8 oz pasta of your choice',
            '2 tbsp olive oil',
            '2 cloves garlic, minced',
            'Salt and pepper to taste',
            'Optional: grated cheese, herbs, vegetables'
          ],
          instructions: [
            'Bring a large pot of salted water to boil.',
            'Cook pasta according to package directions until al dente.',
            'While pasta cooks, heat olive oil in a pan over medium heat.',
            'Add garlic and sauté until fragrant, about 1 minute.',
            'Drain pasta, reserving 1/4 cup of pasta water.',
            'Combine pasta with garlic oil and add pasta water as needed to create a light sauce.',
            'Season with salt and pepper.',
            'Add any additional ingredients you have available.'
          ],
          image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=2032&auto=format&fit=crop',
          preparationTime: '20 mins',
          difficulty: 'Easy',
          tags: ['Pasta', 'Quick', 'Flexible']
        });
      }
      
      setRecipes(generatedRecipes);
      setSelectedRecipe(generatedRecipes[0]);
      setIsLoading(false);
    }, 2000);
  };
  
  if (!productsInCart.length) {
    return null; // Don't show recipe suggestions if cart is empty
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recipe Suggestions</h2>
          <p className="text-muted-foreground">Get cooking ideas based on your cart items</p>
        </div>
        <Button 
          onClick={generateRecipes} 
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? 
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <ChefHat className="mr-2 h-4 w-4" />
          }
          {recipes.length ? 'Refresh Recipes' : 'Get Recipe Ideas'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : selectedRecipe ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{selectedRecipe.title}</CardTitle>
                <CardDescription>{selectedRecipe.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Utensils className="h-3 w-3" />
                    {selectedRecipe.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedRecipe.preparationTime}
                  </Badge>
                  {selectedRecipe.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md overflow-hidden h-64 w-full">
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-muted-foreground">{ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedRecipe.instructions.map((step, index) => (
                      <li key={index} className="text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">More Recipes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recipes.map((recipe) => (
                  <Button
                    key={recipe.id}
                    variant={selectedRecipe.id === recipe.id ? "default" : "outline"}
                    className="w-full justify-start h-auto py-2 px-3"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{recipe.title}</div>
                      <div className="text-xs text-muted-foreground">{recipe.preparationTime} • {recipe.difficulty}</div>
                    </div>
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center mt-2"
                  onClick={generateRecipes}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate More
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Missing Ingredients?</CardTitle>
                <CardDescription>
                  Get everything you need to prepare this recipe
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add All to Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No Recipes Generated Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click the button above to get AI-powered recipe suggestions based on the items in your cart.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeSuggestions;
