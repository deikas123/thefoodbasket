
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currencyFormatter";
import { FoodBasket } from "@/types/foodBasket";
import { Product } from "@/types";
import { ShoppingCart, ChefHat, Sparkles } from "lucide-react";

interface FoodBasketCardProps {
  basket: FoodBasket | any;
  activeTab: string;
  productDetails: {[key: string]: Product};
  onAddToCart: (basket: FoodBasket | any) => void;
  onSaveAIBasket?: (basket: any) => void;
}

const FoodBasketCard = ({ 
  basket, 
  activeTab, 
  productDetails, 
  onAddToCart, 
  onSaveAIBasket 
}: FoodBasketCardProps) => {
  const getProductName = (productId: string) => {
    return productDetails[productId]?.name || "Loading...";
  };

  const isAIGenerated = activeTab === "ai-generated";
  const isPersonalized = activeTab === "personalized";

  return (
    <Card className={`overflow-hidden flex flex-col h-full ${isAIGenerated || isPersonalized ? 'border-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <CardTitle className={`text-lg sm:text-xl ${isAIGenerated ? 'flex items-center gap-2' : ''}`}>
              {isAIGenerated && <Sparkles className="h-4 w-4 text-primary" />}
              {basket.name}
            </CardTitle>
            <CardDescription className="text-sm">{basket.description}</CardDescription>
          </div>
          {isPersonalized && (
            <Badge variant="secondary" className="self-start text-xs">Personalized</Badge>
          )}
          {isAIGenerated && (
            <Badge variant="secondary" className="self-start text-xs">AI Generated</Badge>
          )}
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
            {basket.items ? (
              basket.items.map((item: any) => (
                <li key={item.id}>
                  {getProductName(item.productId)} x{item.quantity}
                </li>
              ))
            ) : basket.products ? (
              basket.products.map((item: any, itemIndex: number) => (
                <li key={itemIndex}>
                  {item.product.name} x{item.quantity}
                </li>
              ))
            ) : null}
          </ul>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              {isPersonalized ? (
                <Badge className="mb-2 text-xs" variant="outline">5% Discount Applied</Badge>
              ) : isAIGenerated ? (
                <Badge className="mb-2 text-xs">Smart Recipe Included</Badge>
              ) : (
                <Badge className="mb-2 text-xs">Recipe Included</Badge>
              )}
              <p className="text-xl sm:text-2xl font-bold">
                {formatCurrency(basket.totalPrice ?? basket.total_price ?? 0)}
              </p>
            </div>
            <div className="flex gap-2">
              {isAIGenerated && onSaveAIBasket && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSaveAIBasket(basket)}
                  title="Save to Collection"
                  className="self-start sm:self-auto"
                >
                  <ChefHat className="h-4 w-4" />
                </Button>
              )}
              {!isAIGenerated && (
                <Button 
                  variant="outline" 
                  size="icon"
                  title="View Recipe"
                  className="self-start sm:self-auto"
                >
                  <ChefHat className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <Button 
          className="w-full text-sm" 
          onClick={() => onAddToCart(basket)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FoodBasketCard;
