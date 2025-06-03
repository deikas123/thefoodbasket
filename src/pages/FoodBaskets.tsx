
import { useState, useEffect } from "react";
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
import { getAllFoodBaskets } from "@/services/foodBasketService";
import { generateAIFoodBaskets, saveGeneratedBasket } from "@/services/aiFoodBasketService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { FoodBasket } from "@/types/foodBasket";
import { getProductById } from "@/services/productService";
import { ShoppingCart, ChefHat, Sparkles, ArrowUpDown, Loader2, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EnhancedRecipeGenerator from "@/components/EnhancedRecipeGenerator";
import KitchenAssistant from "@/components/KitchenAssistant";
import { Product } from "@/types";
import { convertToProduct } from "@/utils/typeConverters";

const FoodBaskets = () => {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState<"price_asc" | "price_desc">("price_asc");
  const [productDetails, setProductDetails] = useState<{[key: string]: Product}>({});
  const [isGeneratingBaskets, setIsGeneratingBaskets] = useState(false);
  const [aiGeneratedBaskets, setAiGeneratedBaskets] = useState<any[]>([]);
  
  const generatePersonalizedBaskets = async (): Promise<FoodBasket[]> => {
    const allBaskets = await getAllFoodBaskets();
    return allBaskets ? allBaskets.slice(0, 2).map(basket => ({
      ...basket,
      name: `Personalized: ${basket.name}`,
      totalPrice: Math.round(basket.totalPrice * 0.95 * 100) / 100
    })) : [];
  };

  const foodBasketsQuery = useQuery({
    queryKey: ["foodBaskets"],
    queryFn: getAllFoodBaskets
  });

  const personalizedBasketsQuery = useQuery({
    queryKey: ["personalizedBaskets"],
    queryFn: generatePersonalizedBaskets,
    enabled: activeTab === "personalized"
  });

  const isLoading = 
    (activeTab === "all" && foodBasketsQuery.isLoading) || 
    (activeTab === "personalized" && personalizedBasketsQuery.isLoading) ||
    (activeTab === "ai-generated" && isGeneratingBaskets);

  const baskets = activeTab === "all" 
    ? (foodBasketsQuery.data || []) 
    : activeTab === "personalized"
    ? (personalizedBasketsQuery.data || [])
    : aiGeneratedBaskets;

  useEffect(() => {
    const fetchProductDetails = async () => {
      const details: {[key: string]: Product} = {};
      
      for (const basket of baskets) {
        if (basket.items) {
          for (const item of basket.items) {
            if (!details[item.productId]) {
              const productData = await getProductById(item.productId);
              if (productData) {
                details[item.productId] = convertToProduct(productData);
              }
            }
          }
        } else if (basket.products) {
          // For AI generated baskets
          for (const item of basket.products) {
            details[item.product.id] = item.product;
          }
        }
      }
      
      setProductDetails(details);
    };
    
    if (baskets.length > 0 && !isLoading) {
      fetchProductDetails();
    }
  }, [baskets, isLoading]);

  const sortedBaskets = [...baskets].sort((a, b) => {
    return sort === "price_asc" 
      ? a.totalPrice - b.totalPrice 
      : b.totalPrice - a.totalPrice;
  });

  const handleAddBasketToCart = async (basket: FoodBasket | any) => {
    try {
      if (basket.items) {
        // Regular basket
        for (const item of basket.items) {
          const productData = await getProductById(item.productId);
          if (productData) {
            const product = convertToProduct(productData);
            addItem(product, item.quantity);
          }
        }
      } else if (basket.products) {
        // AI generated basket
        for (const item of basket.products) {
          addItem(item.product, item.quantity);
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

  const handleGenerateAIBaskets = async () => {
    setIsGeneratingBaskets(true);
    try {
      const generated = await generateAIFoodBaskets({ maxPrice: 50 });
      setAiGeneratedBaskets(generated);
      toast({
        title: "AI Baskets Generated!",
        description: `Generated ${generated.length} smart food baskets based on available products.`,
      });
    } catch (error) {
      console.error("Error generating AI baskets:", error);
      toast({
        title: "Error",
        description: "Could not generate AI baskets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBaskets(false);
    }
  };

  const handleSaveAIBasket = async (basket: any) => {
    try {
      const savedId = await saveGeneratedBasket(basket);
      if (savedId) {
        toast({
          title: "Basket Saved!",
          description: "The AI-generated basket has been saved to your collection.",
        });
        // Refresh the regular baskets query
        foodBasketsQuery.refetch();
      }
    } catch (error) {
      console.error("Error saving AI basket:", error);
      toast({
        title: "Error",
        description: "Could not save the basket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSort = () => {
    setSort(sort === "price_asc" ? "price_desc" : "price_asc");
  };

  const getProductName = (productId: string) => {
    return productDetails[productId]?.name || "Loading...";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-20 sm:pt-24 pb-8 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Smart Food Baskets</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              AI-powered meal planning, curated collections, and your personal kitchen assistant
            </p>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
              <TabsList className="w-full sm:w-auto overflow-x-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All Baskets</TabsTrigger>
                <TabsTrigger value="personalized" className="text-xs sm:text-sm">Personalized</TabsTrigger>
                <TabsTrigger value="ai-generated" className="flex items-center gap-1 text-xs sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  AI Generated
                </TabsTrigger>
                <TabsTrigger value="recipes" className="text-xs sm:text-sm">Recipe Generator</TabsTrigger>
                <TabsTrigger value="assistant" className="text-xs sm:text-sm">Kitchen Assistant</TabsTrigger>
              </TabsList>
              
              {(activeTab === "all" || activeTab === "personalized" || activeTab === "ai-generated") && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {activeTab === "ai-generated" && (
                    <Button 
                      onClick={handleGenerateAIBaskets} 
                      disabled={isGeneratingBaskets}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                      size="sm"
                    >
                      {isGeneratingBaskets ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      {isGeneratingBaskets ? "Generating..." : "Generate AI Baskets"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={toggleSort} className="text-xs sm:text-sm">
                    <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Price: {sort === "price_asc" ? "Low to High" : "High to Low"}</span>
                    <span className="sm:hidden">{sort === "price_asc" ? "↑" : "↓"}</span>
                  </Button>
                </div>
              )}
            </div>
            
            <TabsContent value="all" className="pt-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedBaskets.map((basket) => (
                    <Card key={basket.id} className="overflow-hidden flex flex-col h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg sm:text-xl">{basket.name}</CardTitle>
                        <CardDescription className="text-sm">{basket.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow px-4 sm:px-6">
                        {basket.image && (
                          <div className="w-full h-40 sm:h-48 mb-4 overflow-hidden rounded-md">
                            <img 
                              src={basket.image} 
                              alt={basket.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base sm:text-lg font-medium mb-2">Included Items:</h3>
                          <ul className="list-disc list-inside mb-4 text-xs sm:text-sm text-muted-foreground space-y-1">
                            {basket.items.map((item) => (
                              <li key={item.id}>
                                {getProductName(item.productId)} x{item.quantity}
                              </li>
                            ))}
                          </ul>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                              <Badge className="mb-2 text-xs">Recipe Included</Badge>
                              <p className="text-xl sm:text-2xl font-bold">
                                {formatCurrency(basket.totalPrice)}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              title="View Recipe"
                              className="self-start sm:self-auto"
                            >
                              <ChefHat className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3">
                        <Button 
                          className="w-full text-sm" 
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
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No baskets found</h3>
                  <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                    We couldn't find any food baskets. Please check back later.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="personalized" className="pt-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-40 sm:h-48 w-full rounded-md mb-4" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedBaskets.map((basket) => (
                    <Card key={basket.id} className="overflow-hidden flex flex-col h-full border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg sm:text-xl">{basket.name}</CardTitle>
                            <CardDescription className="text-sm">{basket.description}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="self-start text-xs">Personalized</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow px-4 sm:px-6">
                        {basket.image && (
                          <div className="w-full h-40 sm:h-48 mb-4 overflow-hidden rounded-md">
                            <img 
                              src={basket.image} 
                              alt={basket.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base sm:text-lg font-medium mb-2">Included Items:</h3>
                          <ul className="list-disc list-inside mb-4 text-xs sm:text-sm text-muted-foreground space-y-1">
                            {basket.items.map((item) => (
                              <li key={item.id}>
                                {getProductName(item.productId)} x{item.quantity}
                              </li>
                            ))}
                          </ul>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                              <Badge className="mb-2 text-xs" variant="outline">5% Discount Applied</Badge>
                              <p className="text-xl sm:text-2xl font-bold">
                                {formatCurrency(basket.totalPrice)}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              title="View Recipe"
                              className="self-start sm:self-auto"
                            >
                              <ChefHat className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3">
                        <Button 
                          className="w-full text-sm" 
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
                <div className="text-center py-12 px-4">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No personalized baskets yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
                    To receive personalized basket suggestions, please make some purchases or update your dietary preferences in your profile.
                  </p>
                  <Button onClick={() => setActiveTab("all")}>Browse All Baskets</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ai-generated" className="pt-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
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
              ) : aiGeneratedBaskets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {aiGeneratedBaskets.map((basket, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col h-full border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                              <Sparkles className="h-4 w-4 text-primary" />
                              {basket.name}
                            </CardTitle>
                            <CardDescription className="text-sm">{basket.description}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="self-start text-xs">AI Generated</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow px-4 sm:px-6">
                        <div>
                          <h3 className="text-base sm:text-lg font-medium mb-2">Included Items:</h3>
                          <ul className="list-disc list-inside mb-4 text-xs sm:text-sm text-muted-foreground space-y-1">
                            {basket.products.map((item: any, itemIndex: number) => (
                              <li key={itemIndex}>
                                {item.product.name} x{item.quantity}
                              </li>
                            ))}
                          </ul>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                              <Badge className="mb-2 text-xs">Smart Recipe Included</Badge>
                              <p className="text-xl sm:text-2xl font-bold">
                                {formatCurrency(basket.totalPrice)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSaveAIBasket(basket)}
                                title="Save to Collection"
                                className="self-start sm:self-auto"
                              >
                                <ChefHat className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 space-y-2">
                        <Button 
                          className="w-full text-sm" 
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
                <div className="text-center py-12 px-4">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No AI baskets generated yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
                    Click the "Generate AI Baskets" button to create smart food baskets based on available products and intelligent meal planning.
                  </p>
                  <Button onClick={handleGenerateAIBaskets} disabled={isGeneratingBaskets}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Smart Baskets
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recipes" className="pt-2">
              <EnhancedRecipeGenerator />
            </TabsContent>

            <TabsContent value="assistant" className="pt-2">
              <KitchenAssistant />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoodBaskets;
