
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {sortedBaskets.map((basket, index) => (
        <FoodBasketCard
          key={basket.id || index}
          basket={basket}
          activeTab={activeTab}
          productDetails={productDetails}
          onAddToCart={onAddToCart}
          onSaveAIBasket={onSaveAIBasket}
        />
      ))}
    </div>
  );
};

export default FoodBasketGrid;
