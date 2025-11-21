import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getProductById } from "@/services/productService";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Heart, Minus, Plus, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
import { ProductBundles } from "@/components/product/ProductBundles";
import { SmartRecommendations } from "@/components/product/SmartRecommendations";
import { formatCurrency } from "@/utils/currencyFormatter";
import { toast } from "sonner";
import { Product } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetailsPage = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { trackProductView } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);

  // Track product view
  useEffect(() => {
    if (productId) {
      trackProductView(productId);
    }
  }, [productId, trackProductView]);
  
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

  const productImagesQuery = useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);
      if (error) throw error;
      return data?.map(img => img.image_url) || [];
    },
    enabled: !!productId
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading product...</p>
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 pb-16">
        {/* Product header section */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <h1 className="text-lg font-bold">Product Details</h1>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="h-10 w-10 rounded-full"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className="h-10 w-10 rounded-full"
                >
                  <Heart className={`h-5 w-5 transition-all ${isInWishlist(product.id) ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Product Image Gallery */}
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <ProductImageGallery
              images={productImagesQuery.data}
              image={product.image}
              name={product.name}
              discountPercentage={product.discountPercentage}
              featured={product.featured}
            />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="container mx-auto px-4 space-y-6">
        {/* Title and Price */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-3xl font-bold text-primary">{formatCurrency(getDiscountedPrice())}</p>
              {product.discountPercentage && (
                <p className="text-base text-muted-foreground line-through mt-1">
                  {formatCurrency(product.price)}
                </p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${inStock ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
              {inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-4 bg-muted/50 rounded-2xl p-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-full hover:bg-background"
                disabled={quantity <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="font-bold text-lg w-16 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="h-10 w-10 rounded-full hover:bg-background"
                disabled={quantity >= product.stock}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button 
                onClick={handleAddToCart}
                disabled={!inStock}
                variant="outline"
                className="h-14 rounded-2xl font-semibold border-2 hover:bg-muted"
              >
                Add to Cart
              </Button>
              
              <Button 
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
                disabled={!inStock}
                className="h-14 rounded-2xl font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
              className="w-full h-14 rounded-2xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              Order via WhatsApp
            </Button>
          </div>
        </div>

        {/* Store Info */}
        {store && (
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-2" />
              ) : (
                <Store className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base mb-0.5">{store.name}</p>
              {store.address && (
                <p className="text-sm text-muted-foreground truncate">{store.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-3">
          <h3 className="font-bold text-lg mb-4">Product Information</h3>
          {store && (
            <div className="flex justify-between py-3 border-b last:border-0">
              <span className="text-sm text-muted-foreground font-medium">Brand Name</span>
              <span className="text-sm font-semibold">{store?.name || 'Generic'}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b last:border-0">
            <span className="text-sm text-muted-foreground font-medium">Stock Available</span>
            <span className="text-sm font-semibold">{product.stock} Pieces</span>
          </div>
          <div className="flex justify-between py-3 border-b last:border-0">
            <span className="text-sm text-muted-foreground font-medium">Weight/Size</span>
            <span className="text-sm font-semibold">2kg (4.409 lb)</span>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether 
          productId={productId || ""}
          currentProduct={product}
        />

        {/* Product Bundles */}
        <ProductBundles productId={productId} />

        {/* Reviews Section */}
        <div className="pt-8">
          <ProductReviewsSection productId={productId || ""} />
        </div>

        {/* Smart Recommendations */}
        <SmartRecommendations 
          productId={productId}
          title="You May Also Like"
          limit={8}
        />

        {/* People Also Ordered - Keep as fallback */}
        {relatedProducts.length > 0 && (
          <div className="pt-2 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">Similar Products</h3>
              <button className="text-sm text-primary hover:underline font-medium">View all →</button>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="flex-shrink-0 w-44">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
