
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ChefHat, Plus, Trash2, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [selectedIngredients, setSelectedIngredients] = useState<Product[]>([]);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
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

  const addCustomIngredient = () => {
    if (newIngredient.trim() && !customIngredients.includes(newIngredient.trim())) {
      setCustomIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient("");
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Enhanced Recipe Generator
          </CardTitle>
          <CardDescription>
            Generate personalized recipes using ingredients from your cart, wishlist, or add your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cart" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart ({cartItems.length})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist ({wishlistItems.length})
              </TabsTrigger>
              <TabsTrigger value="custom">
                Custom Ingredients
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cart" className="mt-4">
              <div className="space-y-3">
                <h3 className="font-medium">Select items from your cart:</h3>
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground">Your cart is empty</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cart-${item.product.id}`}
                          checked={selectedIngredients.some(p => p.id === item.product.id)}
                          onCheckedChange={(checked) => 
                            handleProductSelection(item.product, checked as boolean)
                          }
                        />
                        <Label htmlFor={`cart-${item.product.id}`} className="flex-1">
                          {item.product.name} (Qty: {item.quantity})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="wishlist" className="mt-4">
              <div className="space-y-3">
                <h3 className="font-medium">Select items from your wishlist:</h3>
                {wishlistItems.length === 0 ? (
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {wishlistItems.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`wishlist-${item.product.id}`}
                          checked={selectedIngredients.some(p => p.id === item.product.id)}
                          onCheckedChange={(checked) => 
                            handleProductSelection(item.product, checked as boolean)
                          }
                        />
                        <Label htmlFor={`wishlist-${item.product.id}`} className="flex-1">
                          {item.product.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-4">
              <div className="space-y-3">
                <h3 className="font-medium">Add your own ingredients:</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter ingredient name..."
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
                  />
                  <Button onClick={addCustomIngredient} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                      {ingredient}
                      <button
                        onClick={() => removeCustomIngredient(ingredient)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Selected Ingredients:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedIngredients.map((product) => (
                <Badge key={product.id} variant="outline">
                  {product.name}
                </Badge>
              ))}
              {customIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="outline">
                  {ingredient}
                </Badge>
              ))}
            </div>
            
            <Button 
              onClick={generateRecipes} 
              disabled={isGenerating || (selectedIngredients.length === 0 && customIngredients.length === 0)}
              className="w-full"
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
        </CardContent>
      </Card>

      {generatedRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {selectedRecipe && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedRecipe.title}</CardTitle>
                  <CardDescription>{selectedRecipe.description}</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedRecipe.difficulty}</Badge>
                    <Badge variant="secondary">{selectedRecipe.cookingTime}</Badge>
                    <Badge variant="secondary">Serves {selectedRecipe.servings}</Badge>
                    <Badge variant="outline">{selectedRecipe.cuisine}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Recipes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {generatedRecipes.map((recipe) => (
                  <Button
                    key={recipe.id}
                    variant={selectedRecipe?.id === recipe.id ? "default" : "outline"}
                    className="w-full justify-start h-auto py-3 px-3"
                    onClick={() => setSelectedRecipe(recipe)}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRecipeGenerator;
