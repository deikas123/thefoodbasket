
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface EmptyOrdersStateProps {
  onBrowseProducts: () => void;
}

const EmptyOrdersState = ({ onBrowseProducts }: EmptyOrdersStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <ShoppingBag size={30} className="text-muted-foreground" />
      </div>
      <h3 className="font-medium text-xl mb-2">No orders yet</h3>
      <p className="text-muted-foreground mb-6">
        You haven't placed any orders yet. Start shopping to place your first order.
      </p>
      <Button onClick={onBrowseProducts}>
        Browse Products
      </Button>
    </div>
  );
};

export default EmptyOrdersState;
