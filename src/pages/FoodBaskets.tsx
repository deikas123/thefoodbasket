
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FoodBasketTabs from "@/components/foodBaskets/FoodBasketTabs";
import { getAllFoodBaskets } from "@/services/foodBasketService";
import { generateAIFoodBaskets, saveGeneratedBasket } from "@/services/aiFoodBasketService";
import { FoodBasket } from "@/types/foodBasket";
import { getProductById } from "@/services/productService";
import { toast } from "@/hooks/use-toast";
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

  const allBaskets = foodBasketsQuery.data || [];
  const personalizedBaskets = personalizedBasketsQuery.data || [];

  useEffect(() => {
    const fetchProductDetails = async () => {
      const details: {[key: string]: Product} = {};
      const baskets = activeTab === "all" 
        ? allBaskets 
        : activeTab === "personalized"
        ? personalizedBaskets
        : aiGeneratedBaskets;
      
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
          for (const item of basket.products) {
            details[item.product.id] = item.product;
          }
        }
      }
      
      setProductDetails(details);
    };
    
    const baskets = activeTab === "all" 
      ? allBaskets 
      : activeTab === "personalized"
      ? personalizedBaskets
      : aiGeneratedBaskets;

    if (baskets.length > 0) {
      fetchProductDetails();
    }
  }, [allBaskets, personalizedBaskets, aiGeneratedBaskets, activeTab]);

  const handleAddBasketToCart = async (basket: FoodBasket | any) => {
    try {
      if (basket.items) {
        for (const item of basket.items) {
          const productData = await getProductById(item.productId);
          if (productData) {
            const product = convertToProduct(productData);
            addItem(product, item.quantity);
          }
        }
      } else if (basket.products) {
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
          
          <FoodBasketTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allBaskets={allBaskets}
            personalizedBaskets={personalizedBaskets}
            aiGeneratedBaskets={aiGeneratedBaskets}
            isLoadingAll={foodBasketsQuery.isLoading}
            isLoadingPersonalized={personalizedBasketsQuery.isLoading}
            isGeneratingBaskets={isGeneratingBaskets}
            productDetails={productDetails}
            sort={sort}
            onToggleSort={toggleSort}
            onAddToCart={handleAddBasketToCart}
            onSaveAIBasket={handleSaveAIBasket}
            onGenerateAIBaskets={handleGenerateAIBaskets}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoodBaskets;
