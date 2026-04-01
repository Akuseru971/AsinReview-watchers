// src/components/dashboard/kpi-grid.tsx
"use client";

import { useKpis } from "@/hooks/use-kpis";
import { KpiCard } from "@/components/ui/card";
import { Package, Star, MessageSquare, TrendingUp } from "lucide-react";

interface KpiGridProps {
  dateFrom?: string;
  dateTo?: string;
}

export function KpiGrid({ dateFrom, dateTo }: KpiGridProps) {
  const { data, isLoading } = useKpis(dateFrom, dateTo);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total ASINs"
        value={data?.totalAsins ?? 0}
        icon={<Package className="h-5 w-5" />}
        loading={isLoading}
        subtitle="Products tracked"
      />
      <KpiCard
        title="Avg. Rating"
        value={data ? `${data.avgRating.toFixed(2)} ★` : "—"}
        icon={<Star className="h-5 w-5" />}
        loading={isLoading}
        subtitle="Across all ASINs"
      />
      <KpiCard
        title="Total Reviews"
        value={
          data?.totalReviews != null
            ? data.totalReviews.toLocaleString()
            : "—"
        }
        icon={<MessageSquare className="h-5 w-5" />}
        loading={isLoading}
        subtitle={dateFrom ? "In selected range" : "All time"}
      />
      <KpiCard
        title="New Reviews"
        value={
          data?.newReviewsSinceFrom != null
            ? data.newReviewsSinceFrom.toLocaleString()
            : "—"
        }
        icon={<TrendingUp className="h-5 w-5" />}
        loading={isLoading}
        subtitle={dateFrom ? `Since ${dateFrom}` : "Since today"}
      />
    </div>
  );
}
