
// Re-export everything from the refactored product services for backward compatibility
export * from './product/product';
export * from './product/categoryService';
export * from './product/tagService';
export * from './product/offerService';
export * from './product/recommendationService';

// Override getCategoryById from product.ts with the one from categoryService.ts
export { getCategoryById } from './product/categoryService';
