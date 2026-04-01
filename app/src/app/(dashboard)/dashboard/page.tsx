// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import { Topbar } from "@/components/layout/topbar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ProductTable } from "@/components/dashboard/product-table";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/dashboard/export-button";
import { BarChart2, List } from "lucide-react";

interface SearchParams {
  search?: string;
  sort?: string;
  marketplace?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Overview"
        subtitle="All your Amazon ASINs at a glance"
        showSync
      />

      <div className="flex-1 px-6 py-6 space-y-6">
        {/* KPIs */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          }
        >
          <KpiGrid dateFrom={params.dateFrom} dateTo={params.dateTo} />
        </Suspense>

        {/* Filter Bar */}
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <FilterBar />
        </Suspense>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <BarChart2 className="h-4 w-4 text-blue-400" />
              Review Trend (by week)
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-56 w-full" />}>
              <TrendChart
                dateFrom={params.dateFrom}
                dateTo={params.dateTo}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <List className="h-4 w-4 text-blue-400" />
              ASIN List ({params.search ? `filtered` : "all"})
            </div>
            <ExportButton
              filters={{
                dateFrom: params.dateFrom,
                dateTo: params.dateTo,
              }}
            />
          </CardHeader>
          <Suspense
            fallback={
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            }
          >
            <ProductTable />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
