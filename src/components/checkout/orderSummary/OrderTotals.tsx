
import { formatCurrency } from "@/utils/currencyFormatter";
import { Separator } from "@/components/ui/separator";

interface OrderTotalsProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

const OrderTotals = ({ subtotal, deliveryFee, discount, total }: OrderTotalsProps) => {
  return (
    <>
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </>
  );
};

export default OrderTotals;
