
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Users } from "lucide-react";

const Recipes = () => {
  const recipes = [
    {
      id: 1,
      title: "Mediterranean Quinoa Bowl",
      description: "A healthy and delicious bowl packed with fresh vegetables and quinoa",
      cookTime: "25 mins",
      servings: 4,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Grilled Salmon with Herbs",
      description: "Fresh salmon grilled to perfection with aromatic herbs",
      cookTime: "20 mins",
      servings: 2,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Vegetarian Pasta Primavera",
      description: "Colorful vegetables tossed with pasta in a light cream sauce",
      cookTime: "30 mins",
      servings: 6,
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          <ChefHat className="inline-block mr-2" />
          Delicious Recipes
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing recipes made with fresh ingredients from our store
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{recipe.title}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {recipe.cookTime}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {recipe.servings} servings
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
