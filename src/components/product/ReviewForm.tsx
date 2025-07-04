
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { submitProductReview, deleteProductReview, ProductReview } from "@/services/reviewService";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";

interface ReviewFormProps {
  productId: string;
  existingReview: ProductReview | null;
  onSuccess: () => void;
}

interface FormValues {
  comment: string;
}

const ReviewForm = ({ productId, existingReview, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      comment: existingReview?.comment || ''
    }
  });

  // Update form when existing review changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      form.reset({
        comment: existingReview.comment || ''
      });
    } else {
      setRating(0);
      form.reset({
        comment: ''
      });
    }
  }, [existingReview, form]);

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting review form:", { productId, userId: user.id, rating, comment: values.comment });
      
      const result = await submitProductReview(
        productId,
        user.id,
        rating,
        values.comment || null
      );
      
      if (result) {
        console.log("Review submitted, calling onSuccess");
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview || !user) return;
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting review:", existingReview.id);
      
      const success = await deleteProductReview(existingReview.id);
      if (success) {
        form.reset({ comment: '' });
        setRating(0);
        console.log("Review deleted, calling onSuccess");
        onSuccess();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">Please log in to leave a review.</p>
      </div>
    );
  }

  const isEditing = !!existingReview;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <div className="mb-4">
        <div className="flex items-center">
          <span className="mr-2">Rating:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between mt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Submitting...' 
                : isEditing 
                  ? 'Update Review'
                  : 'Submit Review'
              }
            </Button>
            
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Review'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;
