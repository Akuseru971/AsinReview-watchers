// src/components/dashboard/trend-chart.tsx
"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTrend } from "@/hooks/use-trend";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendChartProps {
  dateFrom?: string;
  dateTo?: string;
  productId?: string;
}

export function TrendChart({ dateFrom, dateTo, productId }: TrendChartProps) {
  const { data, isLoading } = useTrend(dateFrom, dateTo, productId);

  if (isLoading) return <Skeleton className="h-56 w-full" />;
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-56 text-slate-500 text-sm">
        No trend data in selected range
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
          vertical={false}
        />
        <XAxis
          dataKey="week"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 5]}
          tickCount={6}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "12px",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
        />
        <Bar
          yAxisId="left"
          dataKey="count"
          name="Reviews"
          fill="#3b82f6"
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgRating"
          name="Avg Rating"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
