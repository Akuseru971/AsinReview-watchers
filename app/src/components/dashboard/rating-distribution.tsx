// src/components/dashboard/rating-distribution.tsx
"use client";

import { RatingBar } from "@/components/ui/star-rating";

interface RatingDistributionProps {
  distribution: Record<number, number>;
  total: number;
}

export function RatingDistribution({ distribution, total }: RatingDistributionProps) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((r) => (
        <RatingBar
          key={r}
          rating={r}
          count={distribution[r] ?? 0}
          total={total}
        />
      ))}
    </div>
  );
}
