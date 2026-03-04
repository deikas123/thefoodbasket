
import { Sparkles, ShoppingBasket, Heart, Bot, ChefHat } from "lucide-react";
import FoodBasketGrid from "./FoodBasketGrid";
import FoodBasketActions from "./FoodBasketActions";
import EnhancedRecipeGenerator from "@/components/EnhancedRecipeGenerator";
import KitchenAssistant from "@/components/KitchenAssistant";
import { FoodBasket } from "@/types/foodBasket";
import { Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

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

const tabs = [
  { id: "all", label: "Popular", icon: ShoppingBasket },
  { id: "personalized", label: "Saved", icon: Heart },
  { id: "ai-generated", label: "AI Smart", icon: Sparkles },
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "assistant", label: "Assistant", icon: Bot },
];

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
  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return (
          <FoodBasketGrid baskets={allBaskets} activeTab="all" isLoading={isLoadingAll}
            productDetails={productDetails} sort={sort} isGeneratingBaskets={isGeneratingBaskets}
            onAddToCart={onAddToCart} onSaveAIBasket={onSaveAIBasket}
            onGenerateAIBaskets={onGenerateAIBaskets} onSwitchTab={setActiveTab} />
        );
      case "personalized":
        return (
          <FoodBasketGrid baskets={personalizedBaskets} activeTab="personalized" isLoading={isLoadingPersonalized}
            productDetails={productDetails} sort={sort} isGeneratingBaskets={isGeneratingBaskets}
            onAddToCart={onAddToCart} onSaveAIBasket={onSaveAIBasket}
            onGenerateAIBaskets={onGenerateAIBaskets} onSwitchTab={setActiveTab} />
        );
      case "ai-generated":
        return (
          <FoodBasketGrid baskets={aiGeneratedBaskets} activeTab="ai-generated" isLoading={isGeneratingBaskets}
            productDetails={productDetails} sort={sort} isGeneratingBaskets={isGeneratingBaskets}
            onAddToCart={onAddToCart} onSaveAIBasket={onSaveAIBasket}
            onGenerateAIBaskets={onGenerateAIBaskets} onSwitchTab={setActiveTab} />
        );
      case "recipes":
        return <EnhancedRecipeGenerator />;
      case "assistant":
        return <KitchenAssistant />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Pill-style tabs inspired by reference */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium
                whitespace-nowrap transition-all duration-200 shrink-0
                ${isActive 
                  ? "bg-[hsl(var(--rally-navy))] text-white shadow-lg shadow-[hsl(var(--rally-navy)/0.3)]" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"}
              `}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-full bg-[hsl(var(--rally-navy))] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Actions bar */}
      {["all", "personalized", "ai-generated"].includes(activeTab) && (
        <div className="flex justify-end mb-4">
          <FoodBasketActions
            activeTab={activeTab}
            sort={sort}
            isGeneratingBaskets={isGeneratingBaskets}
            onToggleSort={onToggleSort}
            onGenerateAIBaskets={onGenerateAIBaskets}
          />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FoodBasketTabs;
