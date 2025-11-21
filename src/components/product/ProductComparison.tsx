import { useComparison } from "@/context/ComparisonContext";
import { Button } from "@/components/ui/button";
import { X, Check, Minus } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductComparison = ({ isOpen, onClose }: ProductComparisonProps) => {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount / 100);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl">Compare Products ({comparisonItems.length}/4)</SheetTitle>
            {comparisonItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearComparison}>
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        {comparisonItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products to compare</p>
            <p className="text-sm text-muted-foreground mt-2">Add products from the shop to compare them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonItems.length}, minmax(250px, 1fr))` }}>
              {comparisonItems.map((product) => (
                <div key={product.id} className="bg-card border rounded-xl p-4 space-y-4">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-8 w-8 rounded-full bg-background/80"
                      onClick={() => removeFromComparison(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div 
                      className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer mb-3"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        onClose();
                      }}
                    >
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Price</span>
                      <div className="text-right">
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(getDiscountedPrice(product.price, product.discountPercentage))}
                        </span>
                        {product.discountPercentage && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.price)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-medium">
                        {product.stock > 0 ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" /> In Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <X className="h-4 w-4" /> Out of Stock
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">{product.rating || 0}/5 ⭐</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Reviews</span>
                      <span className="font-medium">{product.numReviews || 0}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">
                        {product.discountPercentage ? `${product.discountPercentage}%` : <Minus className="h-4 w-4" />}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Featured</span>
                      <span className="font-medium">
                        {product.featured ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      onClose();
                    }}
                  >
                    View Product
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
