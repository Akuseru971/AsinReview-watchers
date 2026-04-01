// src/components/ui/card.tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 border-b border-slate-700/50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("px-5 py-4", className)}>{children}</div>
  );
}

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  loading = false,
}: KpiCardProps) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="rounded-lg bg-blue-600/20 p-3 text-blue-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>
        {loading ? (
          <div className="mt-1 h-7 w-24 animate-pulse rounded bg-slate-700" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold text-white">{value}</p>
        )}
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
