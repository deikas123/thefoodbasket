
import { ProductType } from "@/types/supabase";
import { Product } from "@/types";

export const convertProductTypeToProduct = (productType: ProductType): Product => {
  return {
    id: productType.id,
    name: productType.name,
    price: productType.price,
    image: productType.image,
    description: productType.description,
    category: productType.category_id,
    stock: productType.stock,
    rating: productType.rating,
    numReviews: productType.num_reviews || 0,
    featured: productType.featured,
    discountPercentage: productType.discount_percentage || undefined
  };
};

export const convertProductToProductType = (product: Product): ProductType => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category_id: product.category,
    stock: product.stock,
    featured: product.featured,
    rating: product.rating,
    num_reviews: product.numReviews,
    discount_percentage: product.discountPercentage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
