
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const PayLaterFooter = () => {
  return (
    <div className="flex justify-center mt-8 pt-8 border-t">
      <div className="flex items-center gap-4">
        <Link to="/orders">
          <Button variant="outline" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            My Orders
          </Button>
        </Link>
        <Link to="/wallet">
          <Button variant="outline" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            My Wallet
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline">
            My Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PayLaterFooter;
