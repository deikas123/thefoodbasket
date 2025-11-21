-- Create function to get personalized bundle recommendations
CREATE OR REPLACE FUNCTION public.get_personalized_bundle_recommendations(
  p_user_id uuid,
  p_limit integer DEFAULT 6
)
RETURNS TABLE(
  bundle_id uuid,
  recommendation_score numeric,
  match_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_purchase_categories AS (
    -- Get categories from user's order history
    SELECT DISTINCT p.category_id, COUNT(*) as purchase_count
    FROM orders o
    CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
    JOIN products p ON p.id = (item->>'productId')::uuid
    WHERE o.user_id = p_user_id
    GROUP BY p.category_id
  ),
  user_preferences AS (
    -- Get user's dietary preferences
    SELECT dietary_preferences
    FROM profiles
    WHERE id = p_user_id
  ),
  bundle_scores AS (
    SELECT 
      pb.id as bundle_id,
      pb.name,
      pb.discount_percentage,
      (
        -- Score based on matching categories
        (SELECT COALESCE(SUM(upc.purchase_count * 20), 0)
         FROM bundle_items bi
         JOIN products p ON p.id = bi.product_id
         JOIN user_purchase_categories upc ON upc.category_id = p.category_id
         WHERE bi.bundle_id = pb.id) +
        
        -- Bonus for dietary preference matches (if tags exist)
        (SELECT COALESCE(COUNT(*) * 30, 0)
         FROM bundle_items bi
         JOIN products p ON p.id = bi.product_id
         JOIN product_tag_relations ptr ON ptr.product_id = p.id
         JOIN product_tags pt ON pt.id = ptr.tag_id
         CROSS JOIN user_preferences up
         WHERE bi.bundle_id = pb.id
         AND up.dietary_preferences IS NOT NULL
         AND pt.name = ANY(up.dietary_preferences)) +
        
        -- Bonus for discount percentage
        (pb.discount_percentage * 2) +
        
        -- Bonus for number of items in bundle
        (SELECT COUNT(*) * 5 FROM bundle_items WHERE bundle_id = pb.id)
      )::numeric as score,
      
      -- Generate match reason
      CASE
        WHEN (SELECT COUNT(*) 
              FROM bundle_items bi
              JOIN products p ON p.id = bi.product_id
              JOIN user_purchase_categories upc ON upc.category_id = p.category_id
              WHERE bi.bundle_id = pb.id) > 0
        THEN 'Based on your purchase history'
        WHEN (SELECT COUNT(*)
              FROM bundle_items bi
              JOIN products p ON p.id = bi.product_id
              JOIN product_tag_relations ptr ON ptr.product_id = p.id
              JOIN product_tags pt ON pt.id = ptr.tag_id
              CROSS JOIN user_preferences up
              WHERE bi.bundle_id = pb.id
              AND up.dietary_preferences IS NOT NULL
              AND pt.name = ANY(up.dietary_preferences)) > 0
        THEN 'Matches your dietary preferences'
        WHEN pb.discount_percentage > 20
        THEN 'Great savings opportunity'
        ELSE 'Popular bundle'
      END as reason
    FROM product_bundles pb
    WHERE pb.active = true
  )
  SELECT 
    bs.bundle_id,
    bs.score as recommendation_score,
    bs.reason as match_reason
  FROM bundle_scores bs
  WHERE bs.score > 0
  ORDER BY bs.score DESC, bs.discount_percentage DESC
  LIMIT p_limit;
END;
$function$;