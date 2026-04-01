// src/components/dashboard/review-filter-bar.tsx
"use client";

import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReviewFilters } from "@/types";

interface ReviewFilterBarProps {
  filters: ReviewFilters & { page?: number };
  onChange: (filters: ReviewFilters) => void;
}

export function ReviewFilterBar({ filters, onChange }: ReviewFilterBarProps) {
  const update = (key: keyof ReviewFilters, value: string | boolean | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const hasFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.minRating ||
    filters.maxRating ||
    filters.keyword ||
    filters.marketplace ||
    filters.verifiedOnly;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
      <div className="flex-1 min-w-40">
        <Input
          placeholder="Keyword in review…"
          defaultValue={filters.keyword ?? ""}
          label="Keyword"
          onChange={(e) => update("keyword", e.target.value)}
        />
      </div>

      <div className="w-36">
        <Input
          type="date"
          label="From"
          defaultValue={filters.dateFrom ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
        />
      </div>

      <div className="w-36">
        <Input
          type="date"
          label="To"
          defaultValue={filters.dateTo ?? ""}
          onChange={(e) => update("dateTo", e.target.value)}
        />
      </div>

      <div className="w-28">
        <Select
          label="Min ★"
          defaultValue={String(filters.minRating ?? "")}
          onChange={(e) =>
            update("minRating", e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} ★</option>
          ))}
        </Select>
      </div>

      <div className="w-28">
        <Select
          label="Max ★"
          defaultValue={String(filters.maxRating ?? "")}
          onChange={(e) =>
            update("maxRating", e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} ★</option>
          ))}
        </Select>
      </div>

      <div className="w-32">
        <Select
          label="Marketplace"
          defaultValue={filters.marketplace ?? ""}
          onChange={(e) => update("marketplace", e.target.value)}
        >
          <option value="">All</option>
          <option value="BR">🇧🇷 BR</option>
          <option value="US">🇺🇸 US</option>
          <option value="FR">🇫🇷 FR</option>
          <option value="DE">🇩🇪 DE</option>
          <option value="UK">🇬🇧 UK</option>
          <option value="JP">🇯🇵 JP</option>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-5">
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-slate-600 bg-slate-700 text-blue-500"
            checked={filters.verifiedOnly ?? false}
            onChange={(e) => update("verifiedOnly", e.target.checked)}
          />
          Verified only
        </label>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              dateFrom: undefined,
              dateTo: undefined,
              minRating: undefined,
              maxRating: undefined,
              keyword: undefined,
              marketplace: undefined,
              verifiedOnly: undefined,
            })
          }
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}

      <Button
        variant="danger"
        size="sm"
        onClick={() =>
          onChange({ ...filters, minRating: undefined, maxRating: 2 })
        }
        title="Show only 1–2 star reviews"
      >
        ★★ Low-rated only
      </Button>
    </div>
  );
}
