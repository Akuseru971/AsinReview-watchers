// src/components/ui/star-rating.tsx
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const sizeClass = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <span className={cn("inline-flex items-center gap-1", sizeClass)}>
      <span className="tracking-tight">
        {Array.from({ length: max }).map((_, i) => {
          if (i < full)
            return (
              <span key={i} className="text-amber-400">
                ★
              </span>
            );
          if (i === full && hasHalf)
            return (
              <span key={i} className="text-amber-400">
                ½
              </span>
            );
          return (
            <span key={i} className="text-slate-600">
              ★
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-slate-400 tabular-nums">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}

export function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-slate-400">{rating}★</span>
      <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colors[rating])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-slate-400">{count}</span>
    </div>
  );
}
