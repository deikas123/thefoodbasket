
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FoodBasketTabs from "@/components/foodBaskets/FoodBasketTabs";
import { getAllFoodBaskets, getUserFoodBaskets } from "@/services/foodBasketService";
import { generateAIFoodBaskets, saveGeneratedBasket } from "@/services/aiFoodBasketService";
import { FoodBasket } from "@/types/foodBasket";
import { getProductById } from "@/services/productService";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { convertToProduct } from "@/utils/typeConverters";
import { motion } from "framer-motion";
import { ShoppingBasket } from "lucide-react";

const FoodBaskets = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState<"price_asc" | "price_desc">("price_asc");
  const [productDetails, setProductDetails] = useState<{[key: string]: Product}>({});
  const [isGeneratingBaskets, setIsGeneratingBaskets] = useState(false);
  const [aiGeneratedBaskets, setAiGeneratedBaskets] = useState<any[]>([]);

  const foodBasketsQuery = useQuery({
    queryKey: ["foodBaskets"],
    queryFn: getAllFoodBaskets
  });

  const userBasketsQuery = useQuery({
    queryKey: ["userFoodBaskets", user?.id],
    queryFn: getUserFoodBaskets,
    enabled: !!user && activeTab === "personalized"
  });

  const allBaskets = foodBasketsQuery.data || [];
  const personalizedBaskets = userBasketsQuery.data || [];

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
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save baskets to your collection.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const savedId = await saveGeneratedBasket(basket);
      if (savedId) {
        toast({
          title: "Basket Saved!",
          description: "The AI-generated basket has been saved to your personalized collection.",
        });
        userBasketsQuery.refetch();
        setActiveTab("personalized");
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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-16 sm:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Hero Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-[hsl(var(--rally-navy))] text-white p-5 sm:p-8 mb-6 sm:mb-8"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-[hsl(var(--rally-red)/0.15)] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 bg-[hsl(var(--rally-amber)/0.1)] rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBasket className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--rally-amber))]" />
                  <span className="text-xs sm:text-sm font-medium text-[hsl(var(--rally-amber))]">Smart Baskets</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Food Baskets</h1>
                <p className="text-white/70 text-xs sm:text-sm max-w-md">
                  AI-powered meal planning, curated collections & your personal kitchen assistant
                </p>
              </div>
            </div>
          </motion.div>
          
          <FoodBasketTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allBaskets={allBaskets}
            personalizedBaskets={personalizedBaskets}
            aiGeneratedBaskets={aiGeneratedBaskets}
            isLoadingAll={foodBasketsQuery.isLoading}
            isLoadingPersonalized={userBasketsQuery.isLoading}
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
