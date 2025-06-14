
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Users } from "lucide-react";

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const recipes = [
    {
      id: 1,
      title: "Mediterranean Quinoa Bowl",
      description: "Fresh and healthy quinoa bowl with Mediterranean flavors",
      cookTime: "25 mins",
      servings: 4,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Spicy Thai Stir Fry",
      description: "Quick and easy stir fry with authentic Thai spices",
      cookTime: "15 mins",
      servings: 2,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Classic Italian Pasta",
      description: "Traditional pasta recipe with fresh herbs and tomatoes",
      cookTime: "20 mins",
      servings: 6,
      image: "/placeholder.svg"
    }
  ];

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Recipe Collection</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-200 rounded-t-lg">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{recipe.title}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.cookTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
              <Button className="w-full">View Recipe</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
