import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, Filter, Pencil, Trash2, Loader2, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductReviewsSectionProps {
  productId: string;
}

export const ProductReviewsSection = ({ productId }: ProductReviewsSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState("all");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  // Fetch user's existing review
  const { data: userReview } = useQuery({
    queryKey: ['user-review', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productId, sortBy, filterRating],
    queryFn: async () => {
      let query = supabase
        .from('product_reviews')
        .select('*, profiles(first_name, last_name)')
        .eq('product_id', productId);

      if (filterRating !== 'all') {
        query = query.eq('rating', parseInt(filterRating));
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else if (sortBy === 'rating_high') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'rating_low') {
        query = query.order('rating', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to review');
      if (rating === 0) throw new Error('Please select a rating');
      
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setRating(0);
      setComment("");
      toast.success("Review submitted successfully!");
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error("You've already reviewed this product");
      } else {
        toast.error(error.message || "Failed to submit review");
      }
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, rating, comment }: { reviewId: string; rating: number; comment: string }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('product_reviews')
        .update({
          rating,
          comment: comment.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productId] });
      setEditingReviewId(null);
      toast.success("Review updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update review");
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productId] });
      toast.success("Review deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete review");
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('review_helpfulness')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: true
        }, {
          onConflict: 'review_id,user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success("Thanks for your feedback!");
    }
  });

  const avgRating = reviews?.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews?.filter(r => r.rating === star).length || 0,
    percentage: reviews?.length ? ((reviews.filter(r => r.rating === star).length || 0) / reviews.length) * 100 : 0
  }));

  const startEditing = (review: any) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const renderStars = (value: number, hoverValue: number, onClick: (star: number) => void, onHover: (star: number) => void, onLeave: () => void, size: "sm" | "lg" = "lg") => {
    const sizeClass = size === "lg" ? "h-8 w-8" : "h-6 w-6";
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            onClick={() => onClick(star)}
            className="focus:outline-none"
          >
            <Star
              className={`${sizeClass} transition-all cursor-pointer ${
                star <= (hoverValue || value) 
                  ? 'fill-yellow-500 text-yellow-500' 
                  : 'text-muted-foreground'
              }`}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 border"
      >
        <h3 className="font-bold text-xl mb-6">Customer Reviews</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
            <div className="flex justify-center md:justify-start gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <p className="text-muted-foreground">Based on {reviews?.length || 0} reviews</p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm w-12">{star} star</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: star * 0.1 }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Write Review - Only show if user hasn't reviewed */}
      {user && !userReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 border"
        >
          <h3 className="font-bold text-lg mb-4">Write a Review</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Your Rating</p>
              {renderStars(rating, hoverRating, setRating, setHoverRating, () => setHoverRating(0))}
            </div>

            <Textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />

            <Button
              onClick={() => submitReviewMutation.mutate()}
              disabled={rating === 0 || submitReviewMutation.isPending}
              className="w-full md:w-auto"
            >
              {submitReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* User's existing review */}
      {user && userReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary/5 rounded-2xl p-6 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Your Review</h3>
          </div>
          
          {editingReviewId === userReview.id ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Update Rating</p>
                {renderStars(editRating, hoverRating, setEditRating, setHoverRating, () => setHoverRating(0))}
              </div>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => updateReviewMutation.mutate({ 
                    reviewId: userReview.id, 
                    rating: editRating, 
                    comment: editComment 
                  })}
                  disabled={editRating === 0 || updateReviewMutation.isPending}
                >
                  {updateReviewMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Review"
                  )}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= userReview.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(userReview.created_at), { addSuffix: true })}
                </span>
              </div>
              {userReview.comment && (
                <p className="text-sm leading-relaxed mb-4">{userReview.comment}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEditing(userReview)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your review will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteReviewMutation.mutate(userReview.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/50 rounded-2xl p-6 text-center"
        >
          <p className="text-muted-foreground mb-3">Sign in to leave a review</p>
          <Button variant="outline" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="rating_high">Highest Rating</SelectItem>
            <SelectItem value="rating_low">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {reviews
              .filter(r => r.user_id !== user?.id) // Don't show user's own review in list
              .map((review: any, index: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-6 border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {review.profiles?.first_name || 'Anonymous'} {review.profiles?.last_name?.[0]}.
                      </span>
                      {review.verified_purchase && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm leading-relaxed mb-3">{review.comment}</p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markHelpfulMutation.mutate(review.id)}
                  disabled={!user || markHelpfulMutation.isPending}
                  className="gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Helpful ({review.helpful_count || 0})
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-8"
          >
            No reviews yet. Be the first to review!
          </motion.p>
        )}
      </div>
    </div>
  );
};
