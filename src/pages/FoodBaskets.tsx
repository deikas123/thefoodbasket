
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFoodBaskets, generatePersonalizedBaskets } from "@/services/foodBasketService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { FoodBasket } from "@/types/foodBasket";
import { getProductById } from "@/services/productService";
import { ShoppingCart, ChefHat, Filter, ArrowUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import RecipeSuggestions from "@/components/RecipeSuggestions";

const FoodBaskets = () => {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState<"price_asc" | "price_desc">("price_asc");

  // Fetch food baskets
  const foodBasketsQuery = useQuery({
    queryKey: ["foodBaskets"],
    queryFn: getFoodBaskets
  });

  // Fetch personalized baskets
  const personalizedBasketsQuery = useQuery({
    queryKey: ["personalizedBaskets"],
    queryFn: generatePersonalizedBaskets,
    enabled: activeTab === "personalized"
  });

  const isLoading = 
    (activeTab === "all" && foodBasketsQuery.isLoading) || 
    (activeTab === "personalized" && personalizedBasketsQuery.isLoading);

  const baskets = activeTab === "all" 
    ? foodBasketsQuery.data || [] 
    : personalizedBasketsQuery.data || [];

  // Sort baskets by price
  const sortedBaskets = [...baskets].sort((a, b) => {
    return sort === "price_asc" 
      ? a.totalPrice - b.totalPrice 
      : b.totalPrice - a.totalPrice;
  });

  const handleAddBasketToCart = async (basket: FoodBasket) => {
    try {
      // Add all items in the basket to cart
      for (const item of basket.items) {
        const product = await getProductById(item.productId);
        if (product) {
          addItem(product, item.quantity);
        }
      }
      
      toast({
        title: "Added to cart",
        description: `${basket.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding basket to cart:", error);
      toast({
        title: "Error",
        description: "Could not add all items to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSort = () => {
    setSort(sort === "price_asc" ? "price_desc" : "price_asc");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Food Baskets</h1>
            <p className="text-muted-foreground">
              Curated collections of products with recipes and meal ideas
            </p>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <TabsList className="mb-4 sm:mb-0">
                <TabsTrigger value="all">All Baskets</TabsTrigger>
                <TabsTrigger value="personalized">Personalized</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleSort}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sort === "price_asc" ? "Price: Low to High" : "Price: High to Low"}
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="pt-2">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-48 w-full rounded-md mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5 mb-2" />
                        <Skeleton className="h-4 w-3/5" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : sortedBaskets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedBaskets.map((basket) => (
                    <Card key={basket.id} className="overflow-hidden flex flex-col h-full">
                      <CardHeader>
                        <CardTitle>{basket.name}</CardTitle>
                        <CardDescription>{basket.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {basket.image && (
                          <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
                            <img 
                              src={basket.image} 
                              alt={basket.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Included Items:</h3>
                          <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground">
                            {basket.items.map((item) => (
                              <li key={item.id}>{item.productId} x{item.quantity}</li>
                            ))}
                          </ul>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <Badge className="mb-1">Recipe Included</Badge>
                              <p className="text-2xl font-bold">
                                {formatCurrency(basket.totalPrice)}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              title="View Recipe"
                            >
                              <ChefHat className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handleAddBasketToCart(basket)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No baskets found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any food baskets. Please check back later.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="personalized" className="pt-2">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-48 w-full rounded-md mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5 mb-2" />
                        <Skeleton className="h-4 w-3/5" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : sortedBaskets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedBaskets.map((basket) => (
                    <Card key={basket.id} className="overflow-hidden flex flex-col h-full border-primary/20">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{basket.name}</CardTitle>
                            <CardDescription>{basket.description}</CardDescription>
                          </div>
                          <Badge variant="secondary">Personalized</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {basket.image && (
                          <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
                            <img 
                              src={basket.image} 
                              alt={basket.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Included Items:</h3>
                          <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground">
                            {basket.items.map((item) => (
                              <li key={item.id}>{item.productId} x{item.quantity}</li>
                            ))}
                          </ul>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <Badge className="mb-1" variant="outline">5% Discount Applied</Badge>
                              <p className="text-2xl font-bold">
                                {formatCurrency(basket.totalPrice)}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              title="View Recipe"
                            >
                              <ChefHat className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handleAddBasketToCart(basket)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-medium mb-2">No personalized baskets yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    To receive personalized basket suggestions, please make some purchases or update your dietary preferences in your profile.
                  </p>
                  <Button onClick={() => setActiveTab("all")}>Browse All Baskets</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <Separator className="my-12" />
          
          {/* Recipe Suggestions Section */}
          <RecipeSuggestions />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoodBaskets;
