
import { memo } from "react";
import { Star, MessageSquare, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductReview } from "@/services/reviewService";
import { formatDistanceToNow } from "date-fns";

interface ReviewsListProps {
  reviews: ProductReview[];
  isLoading: boolean;
}

const ReviewsList = memo(({ reviews, isLoading }: ReviewsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No Reviews Yet</h3>
        <p className="text-muted-foreground">Be the first to share your thoughts!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {review.user?.first_name 
                      ? `${review.user.first_name} ${review.user.last_name || ''}`
                      : 'Anonymous User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Badge variant="outline" className="ml-2">
                  {review.rating}/5
                </Badge>
              </div>
            </div>
            
            {review.comment && (
              <div className="mt-3 text-sm">
                {review.comment}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

ReviewsList.displayName = "ReviewsList";
export default ReviewsList;
