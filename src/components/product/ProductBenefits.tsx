
import { TruckIcon, Timer, Check } from "lucide-react";

const ProductBenefits = () => {
  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex items-center gap-2 text-sm">
        <TruckIcon className="h-4 w-4 text-green-600" />
        <span>Free Delivery on orders over $50</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Timer className="h-4 w-4 text-blue-600" />
        <span>Same-Day Dispatch for orders before 2pm</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Check className="h-4 w-4 text-green-600" />
        <span>Easy Returns & Exchange</span>
      </div>
    </div>
  );
};

export default ProductBenefits;
