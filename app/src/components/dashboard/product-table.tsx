// src/components/dashboard/product-table.tsx
"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportButton } from "@/components/dashboard/export-button";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Package2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ProductRow } from "@/types";

const col = createColumnHelper<ProductRow>();

const columns = [
  col.accessor("imageUrl", {
    header: "",
    enableSorting: false,
    cell: (info) => {
      const url = info.getValue();
      return url ? (
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src={url}
            alt="Product"
            fill
            sizes="48px"
            className="object-contain rounded"
            unoptimized
          />
        </div>
      ) : (
        <div className="h-12 w-12 flex-shrink-0 rounded bg-slate-700 flex items-center justify-center">
          <Package2 className="h-5 w-5 text-slate-500" />
        </div>
      );
    },
  }),
  col.accessor("asin", {
    header: "ASIN",
    cell: (info) => (
      <code className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-blue-300">
        {info.getValue()}
      </code>
    ),
  }),
  col.accessor("title", {
    header: "Product Title",
    cell: (info) => (
      <p className="max-w-xs truncate text-sm text-slate-200">
        {info.getValue()}
      </p>
    ),
  }),
  col.accessor("marketplace", {
    header: "Market",
    enableSorting: false,
    cell: (info) => {
      const m = info.getValue();
      return <Badge variant="info">{m.code}</Badge>;
    },
  }),
  col.accessor("amazonRating", {
    header: "Rating",
    cell: (info) => (
      <StarRating rating={info.getValue()} showValue size="sm" />
    ),
  }),
  col.accessor("totalReviewCount", {
    header: "Reviews",
    cell: (info) => (
      <span className="text-sm font-medium tabular-nums">
        {info.getValue().toLocaleString()}
      </span>
    ),
  }),
  col.accessor("latestReviewDate", {
    header: "Latest Review",
    cell: (info) => {
      const d = info.getValue();
      return (
        <span className="text-xs text-slate-400">
          {d ? formatDate(d) : "—"}
        </span>
      );
    },
  }),
  col.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/products/${info.row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
            View
          </Button>
        </Link>
        <ExportButton
          productId={info.row.original.id}
          label="Export"
        />
      </div>
    ),
  }),
];

export function ProductTable() {
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);

  const filters = {
    search: searchParams.get("search") ?? undefined,
    sort: (searchParams.get("sort") as import("@/types").SortOption | undefined) ??
      undefined,
    marketplace: searchParams.get("marketplace") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };

  const { data, isLoading, isError } = useProducts(filters);

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isError) {
    return (
      <EmptyState
        title="Failed to load products"
        description="Check your connection and try again."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Package2 />}
        title="No ASINs found"
        description="Sync your products to see them here, or adjust your filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-500"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="whitespace-nowrap px-4 py-3 font-medium"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "flex cursor-pointer select-none items-center gap-1.5 hover:text-slate-300 transition-colors"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="text-slate-600">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
