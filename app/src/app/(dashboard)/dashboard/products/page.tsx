// src/app/(dashboard)/dashboard/products/page.tsx
import { Suspense } from "react";
import { Topbar } from "@/components/layout/topbar";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ProductTable } from "@/components/dashboard/product-table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/dashboard/export-button";
import { AsinImportCard } from "@/components/dashboard/asin-import-card";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="ASINs"
        subtitle="All your tracked Amazon products"
        showSync
      />

      <div className="flex-1 px-6 py-6 space-y-5">
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <FilterBar />
        </Suspense>

        <AsinImportCard />

        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">
              Product list
            </span>
            <ExportButton
              filters={{
                dateFrom: params.dateFrom,
                dateTo: params.dateTo,
              }}
            />
          </CardHeader>
          <Suspense
            fallback={
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              </CardContent>
            }
          >
            <ProductTable />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
