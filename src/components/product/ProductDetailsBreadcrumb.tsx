
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProductDetailsBreadcrumbProps {
  goBack: () => void;
  category?: {
    id: string;
    name: string;
  } | null;
  productName: string;
}

const ProductDetailsBreadcrumb = ({ 
  goBack, 
  category, 
  productName 
}: ProductDetailsBreadcrumbProps) => {
  return (
    <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" onClick={goBack} className="-ml-3">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <span>/</span>
      <Link to="/shop" className="hover:text-primary">Shop</Link>
      {category && (
        <>
          <span>/</span>
          <Link to={`/shop?category=${category.id}`} className="hover:text-primary">
            {category.name}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-foreground">{productName}</span>
    </div>
  );
};

export default ProductDetailsBreadcrumb;
