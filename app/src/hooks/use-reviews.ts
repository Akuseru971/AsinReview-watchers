// src/hooks/use-reviews.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReviewFilters, ReviewRow } from "@/types";

interface ReviewsResponse {
  data: ReviewRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useReviews(
  productId: string,
  filters: ReviewFilters & { page?: number; pageSize?: number }
) {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.minRating) params.set("minRating", String(filters.minRating));
  if (filters.maxRating) params.set("maxRating", String(filters.maxRating));
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.marketplace) params.set("marketplace", filters.marketplace);
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  return useQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, filters],
    queryFn: () =>
      fetch(`/api/products/${productId}/reviews?${params.toString()}`).then(
        (r) => {
          if (!r.ok) throw new Error("Failed to fetch reviews");
          return r.json();
        }
      ),
    enabled: !!productId,
  });
}
