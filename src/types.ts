import { z } from 'zod';

// Deal schema
export const DealSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  discountPercentage: z.number().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  category: z.string().optional(),
  store: z.string(),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  expirationDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string(),
  createdAt: z.string(),
  popularity: z.number().optional(),
  verified: z.boolean().optional()
});

export type Deal = z.infer<typeof DealSchema>;

// Search parameters schema
export const SearchParamsSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRating: z.number().optional(),
  store: z.string().optional(),
  sortBy: z.enum(['price', 'rating', 'popularity', 'date']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).default(20),
  sources: z.array(z.string()).optional()
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

// Deal source configuration
export const DealSourceSchema = z.object({
  name: z.string(),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  headers: z.record(z.string()).optional(),
  rateLimit: z.number().optional(),
  enabled: z.boolean().default(true)
});

export type DealSource = z.infer<typeof DealSourceSchema>;

// API response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DealSchema).optional(),
  error: z.string().optional(),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional()
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Filter schema
export const FilterSchema = z.object({
  categories: z.array(z.string()).optional(),
  stores: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  ratingRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  tags: z.array(z.string()).optional()
});

export type Filter = z.infer<typeof FilterSchema>;
