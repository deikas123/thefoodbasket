import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById, getCategoryById, getFrequentlyPurchasedTogether } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecommendedProducts from "@/components/RecommendedProducts";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Clock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Zap,
  Loader2,
  HeartOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currencyFormatter";
import AddToAutoReplenishButton from "@/components/product/AddToAutoReplenishButton";
import { convertToProduct } from "@/utils/typeConverters";
import ProductReviews from "@/components/product/ProductReviews";

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem } = useWishlist();
  
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId || ""),
    enabled: !!productId
  });
  
  const categoryQuery = useQuery({
    queryKey: ["category", productQuery.data?.category],
    queryFn: () => getCategoryById(productQuery.data?.category || ""),
    enabled: !!productQuery.data?.category
  });
  
  const product = productQuery.data;
  const category = categoryQuery.data;
  
  const salePrice = product?.discountPercentage
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;
  
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: "Maximum quantity reached",
        description: "You've reached the maximum available quantity for this product.",
        variant: "destructive"
      });
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addItem(convertToProduct(product), quantity);
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      addItem(convertToProduct(product), quantity);
      navigate('/checkout');
    }
  };
  
  const toggleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addToWishlist(convertToProduct(product));
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  const isAddingToCart = productQuery.isLoading || productQuery.isError || !product;

  if (productQuery.isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <Button variant="ghost" onClick={goBack} className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-lg" />
              
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (productQuery.isError || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <Card className="w-full max-w-lg text-center p-8">
            <CardContent className="pt-6 space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h1 className="text-2xl font-bold">Product Not Found</h1>
              <p className="text-muted-foreground">
                We couldn't find the product you're looking for.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-6">
              <Button onClick={() => navigate("/shop")}>
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumb navigation */}
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
            <span className="text-foreground">{product.name}</span>
          </div>
          
          {/* Product details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product image section */}
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discountPercentage && (
                  <Badge className="bg-red-500 text-white">
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
                
                {product.featured && (
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Product info section */}
            <div className="space-y-6">
              {category && (
                <Link to={`/shop?category=${category.id}`}>
                  <Badge variant="outline" className="mb-2">
                    {category.name}
                  </Badge>
                </Link>
              )}
              
              <h1 className="text-3xl font-bold">{product.name}</h1>
              
              <div className="mt-2 flex items-baseline gap-2">
                {salePrice ? (
                  <>
                    <span className="text-2xl font-bold">${salePrice}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>
                      {product.stock > 10 
                        ? 'In Stock' 
                        : `Only ${product.stock} left in stock`
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive">Out of Stock</span>
                  </>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || product.stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock || product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  className="gap-2"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  variant={isInWishlist ? "default" : "outline"}
                  className="gap-2"
                  onClick={toggleWishlist}
                >
                  {isInWishlist ? (
                    <>
                      <HeartOff className="h-4 w-4" />
                      Remove from Wishlist
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      Add to Wishlist
                    </>
                  )}
                </Button>
                
                <AddToAutoReplenishButton 
                  productId={product.id} 
                  productName={product.name} 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Truck className="h-6 w-6 mb-2 text-primary" />
                  <h3 className="font-medium">Free Delivery</h3>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
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
            </div>
          </div>
          
          {/* Product reviews section - NEW */}
          {product && (
            <div className="mt-16">
              <Separator className="mb-8" />
              <ProductReviews productId={product.id} />
            </div>
          )}
          
          {/* Recommended products section */}
          <div className="mt-16">
            <Separator className="mb-8" />
            {product && (
              <RecommendedProducts 
                currentProductId={product.id} 
                currentProductCategory={product.category} 
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
