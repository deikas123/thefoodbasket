
import { Clock, ShieldCheck, Truck } from "lucide-react";

const ProductShippingInfo = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
      <div className="flex flex-col items-center text-center p-4 border rounded-lg">
        <Truck className="h-6 w-6 mb-2 text-primary" />
        <h3 className="font-medium">Free Delivery</h3>
        <p className="text-xs text-muted-foreground">On orders over KSH 1,500</p>
      </div>
      
      <div className="flex flex-col items-center text-center p-4 border rounded-lg">
        <Clock className="h-6 w-6 mb-2 text-primary" />
        <h3 className="font-medium">Same-Day Dispatch</h3>
        <p className="text-xs text-muted-foreground">For orders before 2pm</p>
      </div>
      
      <div className="flex flex-col items-center text-center p-4 border rounded-lg">
        <ShieldCheck className="h-6 w-6 mb-2 text-primary" />
        <h3 className="font-medium">Easy Returns</h3>
        <p className="text-xs text-muted-foreground">30-day return policy</p>
      </div>
    </div>
  );
};

export default ProductShippingInfo;
