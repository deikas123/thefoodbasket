
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
  user?: {
    first_name?: string;
    last_name?: string;
  };
}

export const getProductReviews = async (productId: string): Promise<ProductReview[]> => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user: user_id (
          first_name,
          last_name
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching product reviews:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
};

export const getUserReviewForProduct = async (productId: string, userId: string): Promise<ProductReview | null> => {
  try {
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
    // Check if user has already reviewed this product
    const existingReview = await getUserReviewForProduct(productId, userId);

    // If exists, update the review, otherwise create a new one
    const operation = existingReview ? 
      supabase
        .from('product_reviews')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', existingReview.id)
        .select() :
      supabase
        .from('product_reviews')
        .insert([{ product_id: productId, user_id: userId, rating, comment }])
        .select();

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

    toast({
      title: "Success",
      description: existingReview ? "Your review has been updated." : "Your review has been submitted.",
    });

    return data?.[0] || null;
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
