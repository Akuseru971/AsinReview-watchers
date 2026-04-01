// src/components/dashboard/filter-bar.tsx
"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const update = (key: string, value: string | undefined) => {
    startTransition(() => {
      router.replace(`${pathname}?${createQueryString({ [key]: value })}`, {
        scroll: false,
      });
    });
  };

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("dateFrom") ||
    searchParams.has("dateTo") ||
    searchParams.has("sort") ||
    searchParams.has("marketplace");

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Search */}
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Search ASIN, product title…"
          defaultValue={searchParams.get("search") ?? ""}
          icon={<Search className="h-4 w-4" />}
          onChange={(e) => update("search", e.target.value || undefined)}
        />
      </div>

      {/* Date from */}
      <div className="w-40">
        <Input
          type="date"
          label="From"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value || undefined)}
        />
      </div>

      {/* Date to */}
      <div className="w-40">
        <Input
          type="date"
          label="To"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(e) => update("dateTo", e.target.value || undefined)}
        />
      </div>

      {/* Sort */}
      <div className="w-48">
        <Select
          label="Sort by"
          defaultValue={searchParams.get("sort") ?? "review_date_desc"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="review_date_desc">Most Recent Review</option>
          <option value="rating_desc">Highest Rating</option>
          <option value="rating_asc">Lowest Rating</option>
          <option value="review_count_desc">Most Reviews</option>
        </Select>
      </div>

      {/* Marketplace */}
      <div className="w-36">
        <Select
          label="Marketplace"
          defaultValue={searchParams.get("marketplace") ?? ""}
          onChange={(e) => update("marketplace", e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="US">🇺🇸 US</option>
          <option value="FR">🇫🇷 FR</option>
          <option value="DE">🇩🇪 DE</option>
          <option value="UK">🇬🇧 UK</option>
          <option value="JP">🇯🇵 JP</option>
        </Select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}

      {/* Filter indicator */}
      {hasFilters && (
        <div className="flex items-center gap-1 text-xs text-blue-400">
          <Filter className="h-3.5 w-3.5" />
          Filters active
        </div>
      )}
    </div>
  );
}
