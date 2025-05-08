
// Re-export everything from the refactored product services for backward compatibility
export * from './product';
export * from './categoryService';
export * from './tagService';
export * from './offerService';
export * from './recommendationService';

// Override getCategoryById from product.ts with the one from categoryService.ts
export { getCategoryById } from './categoryService';
