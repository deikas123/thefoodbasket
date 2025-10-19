
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, { message: "Name is required" }).max(200, { message: "Name must be less than 200 characters" }),
  description: z.string().trim().min(10, { message: "Description must be at least 10 characters" }).max(2000, { message: "Description must be less than 2000 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  image: z.string().min(1, { message: "Image is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
  unit: z.enum(['piece', 'kg', 'g', 'bunch', 'pack', 'liter', 'ml']).default('piece'),
  featured: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
  store_id: z.string().optional(),
  brand_name: z.string().trim().max(100, { message: "Brand name must be less than 100 characters" }).optional(),
  weight: z.string().trim().max(50, { message: "Weight must be less than 50 characters" }).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
