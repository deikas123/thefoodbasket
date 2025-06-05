
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface EmptyCartStateProps {
  onContinueShopping: () => void;
}

const EmptyCartState = ({ onContinueShopping }: EmptyCartStateProps) => {
  return (
    <Card className="w-full max-w-lg text-center p-8">
      <CardContent className="pt-6 space-y-4">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground">
          Add some products to your cart before proceeding to checkout.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pt-6">
        <Button onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmptyCartState;
