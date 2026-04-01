// src/hooks/use-trend.ts
"use client";

import { useQuery } from "@tanstack/react-query";

interface TrendPoint {
  week: string;
  count: number;
  avgRating: number;
}

export function useTrend(
  dateFrom?: string,
  dateTo?: string,
  productId?: string
) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (productId) params.set("productId", productId);

  return useQuery<TrendPoint[]>({
    queryKey: ["trend", dateFrom, dateTo, productId],
    queryFn: () =>
      fetch(`/api/reviews/trend?${params.toString()}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch trend");
        return r.json();
      }),
  });
}
