// src/components/dashboard/export-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import type { ReviewFilters } from "@/types";

interface ExportButtonProps {
  productId?: string;
  filters?: ReviewFilters;
  label?: string;
}

export function ExportButton({ productId, filters, label }: ExportButtonProps) {
  const [loading, setLoading] = useState<"xlsx" | "csv" | null>(null);

  const buildParams = (format: "xlsx" | "csv") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (productId) params.set("productId", productId);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    if (filters?.minRating) params.set("minRating", String(filters.minRating));
    if (filters?.maxRating) params.set("maxRating", String(filters.maxRating));
    if (filters?.keyword) params.set("keyword", filters.keyword);
    if (filters?.marketplace) params.set("marketplace", filters.marketplace);
    if (filters?.verifiedOnly) params.set("verifiedOnly", "true");
    return params.toString();
  };

  const download = async (format: "xlsx" | "csv") => {
    setLoading(format);
    try {
      const res = await fetch(`/api/export?${buildParams(format)}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `export.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={() => download("xlsx")}
        loading={loading === "xlsx"}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {label ?? "Export Excel"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => download("csv")}
        loading={loading === "csv"}
      >
        <FileText className="h-4 w-4" />
        CSV
      </Button>
    </div>
  );
}
