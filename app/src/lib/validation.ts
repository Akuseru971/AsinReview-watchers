// src/lib/validation.ts
import { z } from "zod";

export const reviewFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  maxRating: z.coerce.number().int().min(1).max(5).optional(),
  keyword: z.string().max(200).optional(),
  marketplace: z.string().max(10).optional(),
  verifiedOnly: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const productFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  sort: z
    .enum(["rating_desc", "rating_asc", "review_date_desc", "review_count_desc"])
    .optional()
    .default("review_date_desc"),
  marketplace: z.string().max(10).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const exportParamsSchema = reviewFiltersSchema.extend({
  productId: z.string().optional(),
});

export const importAsinsSchema = z.object({
  input: z.string().min(1).max(10000),
  marketplace: z.string().trim().toUpperCase().max(10).default("BR"),
});

export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type ExportParamsInput = z.infer<typeof exportParamsSchema>;
export type ImportAsinsInput = z.infer<typeof importAsinsSchema>;
