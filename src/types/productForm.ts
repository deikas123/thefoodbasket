
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  image: z.string().min(1, { message: "Image is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
  unit: z.enum(['piece', 'kg', 'g', 'bunch', 'pack', 'liter', 'ml']).default('piece'),
  featured: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
