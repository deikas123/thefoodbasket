
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface IngredientSelectorProps {
  selectedIngredients: Product[];
  customIngredients: string[];
  onProductSelection: (product: Product, isSelected: boolean) => void;
  onAddCustomIngredient: (ingredient: string) => void;
  onRemoveCustomIngredient: (ingredient: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const IngredientSelector = ({
  selectedIngredients,
  customIngredients,
  onProductSelection,
  onAddCustomIngredient,
  onRemoveCustomIngredient,
  activeTab,
  onTabChange
}: IngredientSelectorProps) => {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [newIngredient, setNewIngredient] = useState("");

  const handleAddCustomIngredient = () => {
    if (newIngredient.trim() && !customIngredients.includes(newIngredient.trim())) {
      onAddCustomIngredient(newIngredient.trim());
      setNewIngredient("");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="cart" className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Cart ({cartItems.length})
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Wishlist ({wishlistItems.length})
        </TabsTrigger>
        <TabsTrigger value="custom">
          Custom Ingredients
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="cart" className="space-y-4">
        <h3 className="font-medium text-lg">Select items from your cart:</h3>
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <Checkbox
                  id={`cart-${item.product.id}`}
                  checked={selectedIngredients.some(p => p.id === item.product.id)}
                  onCheckedChange={(checked) => 
                    onProductSelection(item.product, checked as boolean)
                  }
                />
                <Label htmlFor={`cart-${item.product.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                </Label>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="wishlist" className="space-y-4">
        <h3 className="font-medium text-lg">Select items from your wishlist:</h3>
        {wishlistItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistItems.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <Checkbox
                  id={`wishlist-${item.product.id}`}
                  checked={selectedIngredients.some(p => p.id === item.product.id)}
                  onCheckedChange={(checked) => 
                    onProductSelection(item.product, checked as boolean)
                  }
                />
                <Label htmlFor={`wishlist-${item.product.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">{item.product.name}</div>
                </Label>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="custom" className="space-y-4">
        <h3 className="font-medium text-lg">Add your own ingredients:</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter ingredient name..."
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
            className="flex-1"
          />
          <Button onClick={handleAddCustomIngredient} size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {customIngredients.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Custom ingredients:</h4>
            <div className="flex flex-wrap gap-2">
              {customIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                  {ingredient}
                  <button
                    onClick={() => onRemoveCustomIngredient(ingredient)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default IngredientSelector;
