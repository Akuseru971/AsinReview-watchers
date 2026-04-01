// src/hooks/use-products.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductRow, ProductFilters } from "@/types";

export function useProducts(filters: ProductFilters & { dateFrom?: string; dateTo?: string }) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.marketplace) params.set("marketplace", filters.marketplace);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  return useQuery<ProductRow[]>({
    queryKey: ["products", filters],
    queryFn: () =>
      fetch(`/api/products?${params.toString()}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch products");
        return r.json();
      }),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () =>
      fetch(`/api/products/${id}`).then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      }),
    enabled: !!id,
  });
}
