
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getFoodBaskets, generatePersonalizedBaskets } from "@/services/foodBasketService";
import { getProductById } from "@/services/productService";
import { FoodBasket } from "@/types/foodBasket";
import { Product } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ShoppingBasket, 
  ShoppingCart,
  Utensils,
  ListFilter,
  ChefHat,
  User
} from "lucide-react";

const FoodBasketsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [baskets, setBaskets] = useState<FoodBasket[]>([]);
  const [personalizedBaskets, setPersonalizedBaskets] = useState<FoodBasket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [basketProducts, setBasketProducts] = useState<{[key: string]: Product[]}>({});
  const [loadingBaskets, setLoadingBaskets] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchBaskets = async () => {
      setIsLoading(true);
      try {
        // Fetch general food baskets
        const basketsData = await getFoodBaskets();
        setBaskets(basketsData);
        
        // Fetch personalized baskets
        if (isAuthenticated) {
          const personalized = await generatePersonalizedBaskets();
          setPersonalizedBaskets(personalized);
        }
      } catch (error) {
        console.error("Error fetching food baskets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBaskets();
  }, [isAuthenticated]);
  
  useEffect(() => {
    // Load products for each basket
    const loadBasketProducts = async () => {
      const allBaskets = [...baskets, ...personalizedBaskets];
      const productMap: {[key: string]: Product[]} = {};
      
      for (const basket of allBaskets) {
        if (basket.items && basket.items.length > 0) {
          const products: Product[] = [];
          
          for (const item of basket.items) {
            const product = await getProductById(item.productId);
            if (product) {
              products.push(product);
            }
          }
          
          productMap[basket.id] = products;
        }
      }
      
      setBasketProducts(productMap);
    };
    
    if (baskets.length > 0 || personalizedBaskets.length > 0) {
      loadBasketProducts();
    }
  }, [baskets, personalizedBaskets]);
  
  const handleAddBasketToCart = async (basket: FoodBasket) => {
    // Set loading state for this basket
    setLoadingBaskets(prev => ({ ...prev, [basket.id]: true }));
    
    try {
      const products = basketProducts[basket.id] || [];
      
      // Add each product to cart
      for (const product of products) {
        const item = basket.items?.find(item => item.productId === product.id);
        if (item) {
          await addItem(product, item.quantity);
        }
      }
    } catch (error) {
      console.error("Error adding basket to cart:", error);
    } finally {
      setLoadingBaskets(prev => ({ ...prev, [basket.id]: false }));
    }
  };

  const basketsToShow = activeTab === "all" 
    ? [...baskets, ...personalizedBaskets] 
    : activeTab === "personalized" 
    ? personalizedBaskets 
    : baskets;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <ShoppingBasket className="mr-2 h-6 w-6" />
                Food Baskets
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete meal packages with pre-selected ingredients and recipes
              </p>
            </div>
            
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center">
                    <ListFilter className="mr-1 h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="standard" className="flex items-center">
                    <ChefHat className="mr-1 h-4 w-4" />
                    Standard
                  </TabsTrigger>
                  {isAuthenticated && (
                    <TabsTrigger value="personalized" className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      For You
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : basketsToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {basketsToShow.map((basket) => {
                const products = basketProducts[basket.id] || [];
                const isPersonalized = personalizedBaskets.some(b => b.id === basket.id);
                
                return (
                  <Card key={basket.id} className="overflow-hidden flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      {basket.image ? (
                        <img 
                          src={basket.image} 
                          alt={basket.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <ShoppingBasket className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      
                      {isPersonalized && (
                        <Badge className="absolute top-2 right-2 bg-blue-500">
                          Personalized
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle>{basket.name}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        {basket.description || `A carefully selected basket of ${products.length} items`}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pb-4 flex-grow">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-sm mb-1 flex items-center">
                            <ShoppingCart className="mr-1 h-4 w-4 text-muted-foreground" />
                            Included Items
                          </h3>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {products.slice(0, 4).map((product, index) => (
                              <li key={product.id}>
                                • {product.name}
                                {index === 3 && products.length > 4 && ` +${products.length - 4} more`}
                              </li>
                            ))}
                            {products.length === 0 && (
                              <li className="italic">Loading items...</li>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm mb-1 flex items-center">
                            <Utensils className="mr-1 h-4 w-4 text-muted-foreground" />
                            Recipe
                          </h3>
                          <div className="text-sm text-muted-foreground overflow-hidden max-h-24">
                            <p className="line-clamp-3">{basket.recipe}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2 border-t">
                      <div className="w-full flex items-center justify-between">
                        <div className="font-bold text-lg">
                          ${basket.totalPrice.toFixed(2)}
                        </div>
                        <Button 
                          onClick={() => handleAddBasketToCart(basket)}
                          disabled={loadingBaskets[basket.id] || products.length === 0}
                        >
                          {loadingBaskets[basket.id] ? "Adding..." : "Add All to Cart"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                <ShoppingBasket className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-2">No Food Baskets Available</h3>
                <p className="text-muted-foreground max-w-md">
                  There are currently no food baskets available. Please check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoodBasketsPage;
