
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user: {
    first_name?: string;
    last_name?: string;
  };
}

export const getProductReviews = async (productId: string): Promise<ProductReview[]> => {
  try {
    console.log("Fetching reviews for product:", productId);
    
    const { data: reviewData, error: reviewError } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (reviewError) {
      console.error("Error fetching product reviews:", reviewError);
      return [];
    }

    if (!reviewData || reviewData.length === 0) {
      console.log("No reviews found for product:", productId);
      return [];
    }

    console.log("Found reviews:", reviewData.length);

    // Fetch user data for each review
    const reviews = await Promise.all(
      reviewData.map(async (review) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', review.user_id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error("Error fetching user data for review:", review.id, userError);
        }

        return {
          ...review,
          user: userData || { first_name: 'Anonymous', last_name: 'User' }
        };
      })
    );

    console.log("Reviews with user data:", reviews);
    return reviews;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
};

export const getUserReviewForProduct = async (productId: string, userId: string): Promise<ProductReview | null> => {
  try {
    console.log("Fetching user review for product:", productId, "user:", userId);
    
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is the "not found" error
        console.error("Error fetching user review:", error);
      }
      return null;
    }

    console.log("Found user review:", data);
    return data;
  } catch (error) {
    console.error("Error fetching user review:", error);
    return null;
  }
};

export const submitProductReview = async (
  productId: string,
  userId: string,
  rating: number,
  comment: string | null
): Promise<ProductReview | null> => {
  try {
    console.log("Submitting review:", { productId, userId, rating, comment });
    
    // Check if user has already reviewed this product
    const existingReview = await getUserReviewForProduct(productId, userId);

    const operation = existingReview ? 
      supabase
        .from('product_reviews')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', existingReview.id)
        .select()
        .single() :
      supabase
        .from('product_reviews')
        .insert([{ product_id: productId, user_id: userId, rating, comment }])
        .select()
        .single();

    const { data, error } = await operation;

    if (error) {
      console.error("Error submitting product review:", error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Review submitted successfully:", data);
    
    toast({
      title: "Success",
      description: existingReview ? "Your review has been updated." : "Your review has been submitted.",
    });

    return data;
  } catch (error) {
    console.error("Error submitting product review:", error);
    toast({
      title: "Error",
      description: "Failed to submit your review. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteProductReview = async (reviewId: string): Promise<boolean> => {
  try {
    console.log("Deleting review:", reviewId);
    
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error("Error deleting product review:", error);
      toast({
        title: "Error",
        description: "Failed to delete your review. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    console.log("Review deleted successfully");
    
    toast({
      title: "Success",
      description: "Your review has been deleted.",
    });

    return true;
  } catch (error) {
    console.error("Error deleting product review:", error);
    toast({
      title: "Error",
      description: "Failed to delete your review. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
