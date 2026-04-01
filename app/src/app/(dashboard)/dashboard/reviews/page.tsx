// src/app/(dashboard)/dashboard/reviews/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { ReviewFilterBar } from "@/components/dashboard/review-filter-bar";
import { ExportButton } from "@/components/dashboard/export-button";
import { Badge, SentimentBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReviewFilters, ReviewRow } from "@/types";

interface ReviewsResponse {
  data: ReviewRow[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export default function ReviewsPage() {
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.minRating) params.set("minRating", String(filters.minRating));
  if (filters.maxRating) params.set("maxRating", String(filters.maxRating));
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.marketplace) params.set("marketplace", filters.marketplace);
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  params.set("page", String(page));
  params.set("pageSize", "20");
  const queryString = params.toString();

  const { data, isLoading, isError } = useQuery<ReviewsResponse>({
    queryKey: ["global-reviews", queryString, page],
    queryFn: () =>
      fetch(`/api/reviews?${queryString}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch reviews");
        return r.json();
      }),
  });

  const handleFilterChange = (f: ReviewFilters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="All Reviews" subtitle="Reviews across all your ASINs" />
      <div className="flex-1 px-6 py-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <ReviewFilterBar filters={filters} onChange={handleFilterChange} />
          <ExportButton filters={filters} />
        </div>
        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">
              {data?.pagination.total != null
                ? `${data.pagination.total.toLocaleString()} reviews`
                : "Reviews"}
            </span>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            )}
            {isError && (
              <EmptyState title="Failed to load reviews" description="Check your connection and try again." />
            )}
            {!isLoading && !isError && (!data?.data || data.data.length === 0) && (
              <EmptyState
                icon={<MessageSquare />}
                title="No reviews found"
                description="Sync your data or adjust your filters."
              />
            )}
            {!isLoading && !isError && data && data.data.length > 0 && (
              <div className="space-y-3">
                {data.data.map((review: ReviewRow) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-xs text-slate-400">
                      Page {page} / {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === data.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRow }) {
  const borderClass =
    review.rating <= 2
      ? "border-red-900/40 bg-red-950/10"
      : review.rating === 3
      ? "border-amber-900/30 bg-amber-950/10"
      : "border-slate-700/30 bg-slate-800/30";

  return (
    <div className={`rounded-xl border p-4 ${borderClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <StarRating rating={review.rating} size="sm" />
            <Badge variant="info">{review.asin}</Badge>
            {review.rating <= 2 && <Badge variant="danger">Low rated</Badge>}
            <SentimentBadge sentiment={review.sentiment} />
            {review.verifiedPurchase && <Badge variant="success">Verified</Badge>}
          </div>
          {review.title && (
            <p className="font-medium text-slate-200 text-sm">{review.title}</p>
          )}
          {review.body && (
            <p className="mt-1 text-sm text-slate-400 line-clamp-3">{review.body}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-600">{review.productTitle}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-slate-500">{formatDate(review.reviewDate)}</p>
          {review.reviewerName && (
            <p className="text-xs text-slate-600 mt-0.5">{review.reviewerName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
