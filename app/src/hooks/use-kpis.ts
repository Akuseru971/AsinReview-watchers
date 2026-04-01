// src/hooks/use-kpis.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { KpiStats } from "@/types";

export function useKpis(dateFrom?: string, dateTo?: string) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);

  return useQuery<KpiStats>({
    queryKey: ["kpis", dateFrom, dateTo],
    queryFn: () =>
      fetch(`/api/kpis?${params.toString()}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch KPIs");
        return r.json();
      }),
  });
}
