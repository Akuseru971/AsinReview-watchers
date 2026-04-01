// src/types/index.ts
// Central type definitions shared across the app

export type Sentiment = "positive" | "neutral" | "negative";
export type SyncStatus = "running" | "success" | "error";
export type SortOption =
  | "rating_desc"
  | "rating_asc"
  | "review_date_desc"
  | "review_count_desc";

// ─── Filter shape used by dashboard & export ───

export interface ReviewFilters {
  dateFrom?: string;   // ISO date string
  dateTo?: string;     // ISO date string
  minRating?: number;
  maxRating?: number;
  keyword?: string;
  marketplace?: string;
  verifiedOnly?: boolean;
}

export interface ProductFilters {
  search?: string;
  sort?: SortOption;
  marketplace?: string;
}

// ─── API response shapes ───

export interface KpiStats {
  totalAsins: number;
  avgRating: number;
  totalReviews: number;
  newReviewsSinceFrom: number;
}

export interface ProductRow {
  id: string;
  asin: string;
  title: string;
  imageUrl: string | null;
  amazonRating: number;
  totalReviewCount: number;
  latestReviewDate: string | null;
  marketplace: { code: string; name: string };
}

export interface ReviewRow {
  id: string;
  productId: string;
  asin: string;
  productTitle: string;
  rating: number;
  title: string | null;
  body: string | null;
  reviewerName: string | null;
  reviewDate: string;
  verifiedPurchase: boolean;
  marketplace: string | null;
  sentiment: Sentiment | null;
}

export interface SyncLogRow {
  id: string;
  status: SyncStatus;
  message: string | null;
  reviewsAdded: number;
  productsAdded: number;
  startedAt: string;
  finishedAt: string | null;
}

// ─── Data-source connector interface ───

export interface ReviewConnector {
  /** Fetch all products for a user from the external source */
  fetchProducts(userId: string): Promise<ExternalProduct[]>;

  /** Fetch reviews for a specific ASIN */
  fetchReviewsByAsin(
    asin: string,
    marketplace: string,
    options?: { since?: Date }
  ): Promise<ExternalReview[]>;

  /** Run full sync: upsert products & reviews, return summary */
  syncReviews(userId: string): Promise<SyncResult>;
}

export interface ExternalProduct {
  asin: string;
  title: string;
  imageUrl?: string;
  amazonRating: number;
  totalReviewCount: number;
  marketplace: string; // marketplace code e.g. "US"
}

export interface ExternalReview {
  reviewExternalId: string;
  rating: number;
  title?: string;
  body?: string;
  reviewerName?: string;
  reviewDate: Date;
  verifiedPurchase?: boolean;
  marketplace?: string;
}

export interface SyncResult {
  productsAdded: number;
  reviewsAdded: number;
  errors: string[];
}
