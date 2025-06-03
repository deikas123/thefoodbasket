
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import FoodBasketGrid from "./FoodBasketGrid";
import FoodBasketActions from "./FoodBasketActions";
import EnhancedRecipeGenerator from "@/components/EnhancedRecipeGenerator";
import KitchenAssistant from "@/components/KitchenAssistant";
import { FoodBasket } from "@/types/foodBasket";
import { Product } from "@/types";

interface FoodBasketTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  allBaskets: FoodBasket[];
  personalizedBaskets: FoodBasket[];
  aiGeneratedBaskets: any[];
  isLoadingAll: boolean;
  isLoadingPersonalized: boolean;
  isGeneratingBaskets: boolean;
  productDetails: {[key: string]: Product};
  sort: "price_asc" | "price_desc";
  onToggleSort: () => void;
  onAddToCart: (basket: FoodBasket | any) => void;
  onSaveAIBasket: (basket: any) => void;
  onGenerateAIBaskets: () => void;
}

const FoodBasketTabs = ({
  activeTab,
  setActiveTab,
  allBaskets,
  personalizedBaskets,
  aiGeneratedBaskets,
  isLoadingAll,
  isLoadingPersonalized,
  isGeneratingBaskets,
  productDetails,
  sort,
  onToggleSort,
  onAddToCart,
  onSaveAIBasket,
  onGenerateAIBaskets
}: FoodBasketTabsProps) => {
  return (
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
        
        <FoodBasketActions
          activeTab={activeTab}
          sort={sort}
          isGeneratingBaskets={isGeneratingBaskets}
          onToggleSort={onToggleSort}
          onGenerateAIBaskets={onGenerateAIBaskets}
        />
      </div>
      
      <TabsContent value="all" className="pt-2">
        <FoodBasketGrid
          baskets={allBaskets}
          activeTab="all"
          isLoading={isLoadingAll}
          productDetails={productDetails}
          sort={sort}
          isGeneratingBaskets={isGeneratingBaskets}
          onAddToCart={onAddToCart}
          onSaveAIBasket={onSaveAIBasket}
          onGenerateAIBaskets={onGenerateAIBaskets}
          onSwitchTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="personalized" className="pt-2">
        <FoodBasketGrid
          baskets={personalizedBaskets}
          activeTab="personalized"
          isLoading={isLoadingPersonalized}
          productDetails={productDetails}
          sort={sort}
          isGeneratingBaskets={isGeneratingBaskets}
          onAddToCart={onAddToCart}
          onSaveAIBasket={onSaveAIBasket}
          onGenerateAIBaskets={onGenerateAIBaskets}
          onSwitchTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="ai-generated" className="pt-2">
        <FoodBasketGrid
          baskets={aiGeneratedBaskets}
          activeTab="ai-generated"
          isLoading={isGeneratingBaskets}
          productDetails={productDetails}
          sort={sort}
          isGeneratingBaskets={isGeneratingBaskets}
          onAddToCart={onAddToCart}
          onSaveAIBasket={onSaveAIBasket}
          onGenerateAIBaskets={onGenerateAIBaskets}
          onSwitchTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="recipes" className="pt-2">
        <EnhancedRecipeGenerator />
      </TabsContent>

      <TabsContent value="assistant" className="pt-2">
        <KitchenAssistant />
      </TabsContent>
    </Tabs>
  );
};

export default FoodBasketTabs;
