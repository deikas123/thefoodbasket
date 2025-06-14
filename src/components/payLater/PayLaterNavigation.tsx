
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const PayLaterNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Shop
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PayLaterNavigation;
