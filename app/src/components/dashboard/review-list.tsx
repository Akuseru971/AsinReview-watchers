// src/components/dashboard/review-list.tsx
"use client";

import { useState } from "react";
import { useReviews } from "@/hooks/use-reviews";
import { SentimentBadge, Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewFilterBar } from "@/components/dashboard/review-filter-bar";
import { ExportButton } from "@/components/dashboard/export-button";
import { formatDate } from "@/lib/utils";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReviewFilters, ReviewRow } from "@/types";

interface ReviewListProps {
  productId: string;
  initialDateFrom?: string;
  initialDateTo?: string;
  showFilters?: boolean;
}

export function ReviewList({
  productId,
  initialDateFrom,
  initialDateTo,
  showFilters = true,
}: ReviewListProps) {
  const [filters, setFilters] = useState<ReviewFilters>({
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError } = useReviews(productId, {
    ...filters,
    page,
    pageSize: PAGE_SIZE,
  });

  const handleFilterChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <ReviewFilterBar filters={filters} onChange={handleFilterChange} />
          <ExportButton productId={productId} filters={filters} />
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Failed to load reviews"
          description="Check your connection and try again."
        />
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          icon={<MessageSquare />}
          title="No reviews found"
          description="Try adjusting your filters."
        />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            {data.pagination.total.toLocaleString()} reviews found
          </p>

          <div className="space-y-3">
            {data.data.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRow }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_BODY = 280;
  const isLong = (review.body?.length ?? 0) > MAX_BODY;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        review.rating <= 2
          ? "border-red-900/40 bg-red-950/10"
          : review.rating === 3
          ? "border-amber-900/30 bg-amber-950/10"
          : "border-slate-700/30 bg-slate-800/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <StarRating rating={review.rating} size="sm" />
            {review.rating <= 2 && (
              <Badge variant="danger">Low rated</Badge>
            )}
            <SentimentBadge sentiment={review.sentiment} />
            {review.verifiedPurchase && (
              <Badge variant="success">Verified</Badge>
            )}
            {review.marketplace && (
              <Badge variant="info">{review.marketplace}</Badge>
            )}
          </div>

          {review.title && (
            <p className="font-medium text-slate-200 text-sm">{review.title}</p>
          )}

          {review.body && (
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">
              {!expanded && isLong
                ? review.body.slice(0, MAX_BODY) + "…"
                : review.body}
              {isLong && (
                <button
                  className="ml-1 text-blue-400 hover:text-blue-300 text-xs"
                  onClick={() => setExpanded((e) => !e)}
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </p>
          )}
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
