import { z } from 'zod';

export const recipeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be a positive number'),
  takeaway: z.boolean().default(false),
  brew_method_id: z.coerce.number().int().positive('Select a brew method'),
  ingredients: z
    .array(
      z.object({
        ingredient_id: z.number().int().positive(),
        quantity: z.string().min(1, 'Quantity is required'),
      })
    )
    .default([]),
  image_url: z.string().optional(),
});
