import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProductById } from "@/services/productService";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Heart, Minus, Plus, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { formatCurrency } from "@/utils/currencyFormatter";
import { toast } from "sonner";
import { Product } from "@/types";

const ProductDetailsPage = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId || ""),
    enabled: !!productId
  });

  // Fetch the full product data from database to get store_id and category_id
  const fullProductQuery = useQuery({
    queryKey: ["full-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("store_id, category_id")
        .eq("id", productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId
  });

  const storeQuery = useQuery({
    queryKey: ["store", fullProductQuery.data?.store_id],
    queryFn: async () => {
      if (!fullProductQuery.data?.store_id) return null;
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", fullProductQuery.data.store_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!fullProductQuery.data?.store_id
  });

  const relatedProductsQuery = useQuery({
    queryKey: ["related-products", fullProductQuery.data?.category_id],
    queryFn: async () => {
      if (!fullProductQuery.data?.category_id) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", fullProductQuery.data.category_id)
        .neq("id", productId)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!fullProductQuery.data?.category_id
  });
  
  const product = productQuery.data;
  const store = storeQuery.data;
  const relatedProducts = relatedProductsQuery.data || [];

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const getDiscountedPrice = () => {
    if (!product?.discountPercentage) return product?.price || 0;
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      price: getDiscountedPrice(),
      image: getImageUrl(product.image),
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addItem(cartProduct, quantity);
    toast(`${quantity} x ${product.name} added to cart`);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const wishlistProduct: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.image),
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addToWishlist(wishlistProduct);
    toast(isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard");
    }
  };
  
  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-50 bg-background border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="aspect-square w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  if (productQuery.isError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <h1 className="text-base font-semibold">Details</h1>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-9 w-9"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className="h-9 w-9"
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Product Image */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="aspect-square bg-background rounded-2xl overflow-hidden relative">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="container mx-auto px-4 space-y-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{product.name}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{formatCurrency(getDiscountedPrice())}</p>
            {product.discountPercentage && (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </p>
            )}
            <p className="text-xs text-green-600 font-medium mt-1">
              {inStock ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>
        </div>

        {/* Store Info */}
        {store && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-contain" />
              ) : (
                <Store className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{store.name}</p>
              {store.address && (
                <p className="text-xs text-muted-foreground">{store.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="space-y-2">
          {store && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Brand Name:</span>
              <span className="text-sm font-medium">{store?.name || 'Generic'}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Quantity in Stock:</span>
            <span className="text-sm font-medium">{product.stock} Pcs</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Weight/Size:</span>
            <span className="text-sm font-medium">2kg = 4.409 lb</span>
          </div>
        </div>

        {/* People Also Ordered */}
        {relatedProducts.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">People also Ordered</h3>
              <button className="text-sm text-primary hover:underline">View all</button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="flex-shrink-0 w-40">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40 space-y-2">
        <div className="container mx-auto">
          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-3 bg-muted rounded-lg p-2 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-semibold w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="h-8 w-8"
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleAddToCart}
              disabled={!inStock}
              variant="outline"
              className="h-12"
            >
              Add to Cart
            </Button>
            
            <Button 
              onClick={() => {
                handleAddToCart();
                navigate("/checkout");
              }}
              disabled={!inStock}
              className="h-12 bg-primary hover:bg-primary/90"
            >
              Order Now
            </Button>
          </div>

          <Button 
            onClick={() => {
              const message = `Hi! I'd like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nPrice: ${formatCurrency(getDiscountedPrice() * quantity)}\n\nProduct ID: ${product.id}`;
              const whatsappUrl = `https://wa.me/254798435685?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            disabled={!inStock}
            variant="secondary"
            className="w-full h-12 mt-2 bg-green-600 hover:bg-green-700 text-white"
          >
            Order via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
