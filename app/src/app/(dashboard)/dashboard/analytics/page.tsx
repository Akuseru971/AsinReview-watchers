// src/app/(dashboard)/dashboard/analytics/page.tsx
import { Suspense } from "react";
import { Topbar } from "@/components/layout/topbar";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Analytics" subtitle="Review trends and insights" />

      <div className="flex-1 px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">
              Global Review Trend (weekly)
            </span>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64" />}>
              <TrendChart
                dateFrom={params.dateFrom}
                dateTo={params.dateTo}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
