// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const variants: Record<Variant, string> = {
  default: "bg-slate-700 text-slate-200",
  success: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
  warning: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
  danger: "bg-red-900/60 text-red-300 border border-red-700/50",
  info: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
  neutral: "bg-slate-700/60 text-slate-300 border border-slate-600/50",
};

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment?: string | null }) {
  if (!sentiment) return null;
  const map: Record<string, { variant: Variant; label: string }> = {
    positive: { variant: "success", label: "Positive" },
    neutral: { variant: "neutral", label: "Neutral" },
    negative: { variant: "danger", label: "Negative" },
  };
  const cfg = map[sentiment];
  if (!cfg) return null;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function RatingBadge({ rating }: { rating: number }) {
  const variant: Variant =
    rating >= 4 ? "success" : rating === 3 ? "warning" : "danger";
  return (
    <Badge variant={variant}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </Badge>
  );
}
