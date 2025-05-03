
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewsList from "./ReviewsList";
import ReviewForm from "./ReviewForm";
import { getProductReviews, getUserReviewForProduct, ProductReview } from "@/services/reviewService";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  
  // Fetch all reviews for this product
  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => getProductReviews(productId),
    enabled: !!productId,
  });
  
  // Fetch the current user's review if they're logged in
  const {
    data: currentUserReview,
    isLoading: isLoadingUserReview,
  } = useQuery({
    queryKey: ["user-review", productId, user?.id],
    queryFn: () => getUserReviewForProduct(productId, user!.id),
    enabled: !!productId && !!user?.id,
  });
  
  // Update local state when the user's review query completes
  useEffect(() => {
    if (!isLoadingUserReview) {
      setUserReview(currentUserReview || null);
    }
  }, [currentUserReview, isLoadingUserReview]);
  
  const handleReviewSuccess = useCallback(() => {
    refetchReviews();
    if (user) {
      // Refetch the current user's review
      getUserReviewForProduct(productId, user.id).then(review => {
        setUserReview(review);
      });
    }
  }, [productId, refetchReviews, user]);
  
  const reviewCount = reviews.length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      
      <div className="flex items-center mb-6">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        
        <span className="ml-2 font-semibold">
          {averageRating.toFixed(1)}/5
        </span>
        
        <span className="ml-4 text-sm text-muted-foreground">
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="write">Write a Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="mt-4">
          <ReviewsList reviews={reviews} isLoading={isLoadingReviews} />
        </TabsContent>
        
        <TabsContent value="write" className="mt-4">
          <ReviewForm 
            productId={productId} 
            existingReview={userReview}
            onSuccess={handleReviewSuccess}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default ProductReviews;
