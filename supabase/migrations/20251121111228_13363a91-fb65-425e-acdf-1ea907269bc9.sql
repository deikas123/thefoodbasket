-- Create recently viewed products table
CREATE TABLE IF NOT EXISTS public.recently_viewed_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_viewed ON public.recently_viewed_products(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product ON public.recently_viewed_products(product_id);

-- Enable RLS
ALTER TABLE public.recently_viewed_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recently viewed
CREATE POLICY "Users can view their own recently viewed products"
  ON public.recently_viewed_products
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently viewed products"
  ON public.recently_viewed_products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently viewed products"
  ON public.recently_viewed_products
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add helpful flag to product reviews for moderation
ALTER TABLE public.product_reviews 
ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_purchase boolean DEFAULT false;

-- Create review helpfulness tracking table
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_helpful boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS for review helpfulness
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view review helpfulness"
  ON public.review_helpfulness
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can mark reviews as helpful"
  ON public.review_helpfulness
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for review helpfulness
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review ON public.review_helpfulness(review_id);

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.product_reviews
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM public.review_helpfulness 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
    AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review helpful count
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON public.review_helpfulness;
CREATE TRIGGER update_review_helpful_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.review_helpfulness
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Create function to get product recommendations based on category and purchase history
CREATE OR REPLACE FUNCTION get_product_recommendations(
  p_user_id uuid DEFAULT NULL,
  p_product_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  product_id uuid,
  recommendation_score numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    -- Get categories from user's order history
    SELECT DISTINCT p.category_id, COUNT(*) as purchase_count
    FROM orders o
    CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
    JOIN products p ON p.id = (item->>'productId')::uuid
    WHERE o.user_id = p_user_id
    GROUP BY p.category_id
  ),
  viewed_categories AS (
    -- Get categories from recently viewed
    SELECT DISTINCT p.category_id, COUNT(*) as view_count
    FROM recently_viewed_products rv
    JOIN products p ON p.id = rv.product_id
    WHERE rv.user_id = p_user_id
    GROUP BY p.category_id
  ),
  current_product_category AS (
    -- Get current product's category
    SELECT category_id
    FROM products
    WHERE id = p_product_id
  )
  SELECT 
    p.id as product_id,
    (
      -- Score based on same category as current product (highest priority)
      CASE 
        WHEN EXISTS(SELECT 1 FROM current_product_category cpc WHERE cpc.category_id = p.category_id) 
        THEN 100 
        ELSE 0 
      END +
      -- Score based on purchase history
      COALESCE((SELECT purchase_count * 10 FROM user_categories uc WHERE uc.category_id = p.category_id), 0) +
      -- Score based on view history
      COALESCE((SELECT view_count * 5 FROM viewed_categories vc WHERE vc.category_id = p.category_id), 0) +
      -- Score based on product rating
      (p.rating * 2) +
      -- Boost for featured products
      CASE WHEN p.featured THEN 20 ELSE 0 END +
      -- Boost for discounted products
      CASE WHEN p.discount_percentage > 0 THEN 15 ELSE 0 END
    )::numeric as recommendation_score
  FROM products p
  WHERE p.stock > 0 
    AND p.id != COALESCE(p_product_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (p_user_id IS NULL OR p.id NOT IN (
      SELECT rv.product_id 
      FROM recently_viewed_products rv 
      WHERE rv.user_id = p_user_id 
      AND rv.viewed_at > now() - interval '1 hour'
    ))
  ORDER BY recommendation_score DESC, p.rating DESC, p.num_reviews DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;