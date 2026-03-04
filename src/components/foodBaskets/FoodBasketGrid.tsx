
import FoodBasketCard from "./FoodBasketCard";
import EmptyState from "./EmptyState";
import { FoodBasket } from "@/types/foodBasket";
import { Product } from "@/types";

interface FoodBasketGridProps {
  baskets: (FoodBasket | any)[];
  activeTab: string;
  isLoading: boolean;
  productDetails: {[key: string]: Product};
  sort: "price_asc" | "price_desc";
  isGeneratingBaskets: boolean;
  onAddToCart: (basket: FoodBasket | any) => void;
  onSaveAIBasket: (basket: any) => void;
  onGenerateAIBaskets: () => void;
  onSwitchTab: (tab: string) => void;
}

const FoodBasketGrid = ({
  baskets,
  activeTab,
  isLoading,
  productDetails,
  sort,
  isGeneratingBaskets,
  onAddToCart,
  onSaveAIBasket,
  onGenerateAIBaskets,
  onSwitchTab
}: FoodBasketGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border/50 bg-card animate-pulse">
            <div className="h-36 sm:h-44 bg-muted" />
            <div className="p-3.5 sm:p-4 space-y-2.5">
              <div className="h-4 bg-muted rounded-lg w-3/4" />
              <div className="h-3 bg-muted rounded-lg w-1/2" />
              <div className="flex gap-1.5 mt-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted" />
                ))}
              </div>
              <div className="h-9 sm:h-10 bg-muted rounded-xl mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sortedBaskets = [...baskets].sort((a, b) => {
    return sort === "price_asc" 
      ? a.totalPrice - b.totalPrice 
      : b.totalPrice - a.totalPrice;
  });

  if (sortedBaskets.length === 0) {
    return (
      <EmptyState 
        activeTab={activeTab}
        onGenerateAIBaskets={onGenerateAIBaskets}
        onSwitchTab={onSwitchTab}
        isGenerating={isGeneratingBaskets}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {sortedBaskets.map((basket, index) => (
        <FoodBasketCard
          key={basket.id || index}
          basket={basket}
          activeTab={activeTab}
          productDetails={productDetails}
          onAddToCart={onAddToCart}
          onSaveAIBasket={onSaveAIBasket}
          index={index}
        />
      ))}
    </div>
  );
};

export default FoodBasketGrid;
