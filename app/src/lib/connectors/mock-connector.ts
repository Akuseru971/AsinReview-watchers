// src/lib/connectors/mock-connector.ts
// Mock implementation of ReviewConnector — replace with a real Amazon connector

import type {
  ReviewConnector,
  ExternalProduct,
  ExternalReview,
  SyncResult,
} from "@/types";
import { sentimentFromRating } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const MOCK_PRODUCTS: ExternalProduct[] = [
  {
    asin: "B08N5WRWNW",
    title: "Echo Dot (4th Gen) Smart Speaker with Alexa – Charcoal",
    imageUrl: "https://m.media-amazon.com/images/I/61u4HxVONUL._AC_SL1000_.jpg",
    amazonRating: 4.7,
    totalReviewCount: 312485,
    marketplace: "US",
  },
  {
    asin: "B07XJ8C8F5",
    title: "Fire TV Stick 4K streaming device with Alexa Voice Remote",
    imageUrl: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg",
    amazonRating: 4.6,
    totalReviewCount: 289034,
    marketplace: "US",
  },
  {
    asin: "B09B93ZDG4",
    title: "Kindle Paperwhite (16 GB) – 6.8\" display, adjustable warm light",
    imageUrl: "https://m.media-amazon.com/images/I/61FBaGLDJ+L._AC_SL1000_.jpg",
    amazonRating: 4.8,
    totalReviewCount: 98234,
    marketplace: "US",
  },
  {
    asin: "B07PXGQC1Q",
    title: "AmazonBasics Neoprene Classic Dumbbell Hand Weights",
    imageUrl: "https://m.media-amazon.com/images/I/81j11z+NHAL._AC_SL1500_.jpg",
    amazonRating: 4.5,
    totalReviewCount: 45210,
    marketplace: "US",
  },
  {
    asin: "B0BVZNJLCC",
    title: "Anker Soundcore Life Q30 Hybrid Active Noise Cancelling Headphones",
    imageUrl: "https://m.media-amazon.com/images/I/71YwrWDSqhL._AC_SL1500_.jpg",
    amazonRating: 4.4,
    totalReviewCount: 61000,
    marketplace: "US",
  },
];

function generateMockReviews(
  asin: string,
  count = 20,
  since?: Date
): ExternalReview[] {
  const reviewers = [
    "Alice M.",
    "Bob T.",
    "Carol L.",
    "David R.",
    "Emma S.",
    "Frank B.",
    "Grace H.",
    "Henry K.",
    "Iris W.",
    "Jack P.",
  ];
  const positives = [
    "Absolutely love this product!",
    "Works perfectly, highly recommend.",
    "Great quality for the price.",
    "Exceeded my expectations.",
    "Best purchase I've made this year.",
  ];
  const negatives = [
    "Stopped working after 2 weeks.",
    "Poor build quality.",
    "Doesn't match the description.",
    "Customer service was unhelpful.",
    "Would not buy again.",
  ];
  const neutrals = [
    "It's okay, does the job.",
    "Average product, nothing special.",
    "Works as described.",
    "Pretty good but could be better.",
    "Meets basic expectations.",
  ];

  const reviews: ExternalReview[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 5) + 1;
    const daysAgo = Math.floor(Math.random() * 365);
    const reviewDate = new Date(now);
    reviewDate.setDate(reviewDate.getDate() - daysAgo);

    if (since && reviewDate < since) continue;

    const bodies = rating >= 4 ? positives : rating === 3 ? neutrals : negatives;

    reviews.push({
      reviewExternalId: `${asin}-mock-${i}`,
      rating,
      title:
        rating >= 4
          ? `Great product #${i}`
          : rating === 3
          ? `Decent product #${i}`
          : `Disappointing product #${i}`,
      body: bodies[Math.floor(Math.random() * bodies.length)] +
        ` (ASIN: ${asin}, review #${i})`,
      reviewerName: reviewers[Math.floor(Math.random() * reviewers.length)],
      reviewDate,
      verifiedPurchase: Math.random() > 0.3,
      marketplace: "US",
    });
  }

  return reviews;
}

export const mockConnector: ReviewConnector = {
  async fetchProducts(_userId: string): Promise<ExternalProduct[]> {
    return MOCK_PRODUCTS;
  },

  async fetchReviewsByAsin(
    asin: string,
    _marketplace: string,
    options?: { since?: Date }
  ): Promise<ExternalReview[]> {
    return generateMockReviews(asin, 25, options?.since);
  },

  async syncReviews(userId: string): Promise<SyncResult> {
    let productsAdded = 0;
    let reviewsAdded = 0;
    const errors: string[] = [];

    const products = await this.fetchProducts(userId);

    // Ensure marketplace exists
    const marketplace = await prisma.marketplace.upsert({
      where: { code: "US" },
      update: {},
      create: { code: "US", name: "Amazon.com", domain: "amazon.com" },
    });

    for (const extProduct of products) {
      try {
        const product = await prisma.product.upsert({
          where: {
            userId_asin_marketplaceId: {
              userId,
              asin: extProduct.asin,
              marketplaceId: marketplace.id,
            },
          },
          update: {
            title: extProduct.title,
            imageUrl: extProduct.imageUrl,
            amazonRating: extProduct.amazonRating,
            totalReviewCount: extProduct.totalReviewCount,
          },
          create: {
            userId,
            asin: extProduct.asin,
            title: extProduct.title,
            imageUrl: extProduct.imageUrl,
            amazonRating: extProduct.amazonRating,
            totalReviewCount: extProduct.totalReviewCount,
            marketplaceId: marketplace.id,
          },
        });

        const existing = await prisma.review.findFirst({
          where: { productId: product.id },
          orderBy: { reviewDate: "desc" },
        });

        const reviews = await this.fetchReviewsByAsin(
          extProduct.asin,
          "US",
          existing ? { since: existing.reviewDate } : undefined
        );

        for (const rev of reviews) {
          try {
            const sentiment = sentimentFromRating(rev.rating);
            await prisma.review.upsert({
              where: {
                productId_reviewExternalId: {
                  productId: product.id,
                  reviewExternalId: rev.reviewExternalId,
                },
              },
              update: {
                rating: rev.rating,
                title: rev.title,
                body: rev.body,
                reviewerName: rev.reviewerName,
                reviewDate: rev.reviewDate,
                verifiedPurchase: rev.verifiedPurchase ?? false,
                sentiment,
              },
              create: {
                productId: product.id,
                reviewExternalId: rev.reviewExternalId,
                rating: rev.rating,
                title: rev.title,
                body: rev.body,
                reviewerName: rev.reviewerName,
                reviewDate: rev.reviewDate,
                verifiedPurchase: rev.verifiedPurchase ?? false,
                marketplaceId: marketplace.id,
                sentiment,
              },
            });
            reviewsAdded++;
          } catch {
            errors.push(`Failed to upsert review ${rev.reviewExternalId}`);
          }
        }

        // Update latestReviewDate & counts
        const latestReview = await prisma.review.findFirst({
          where: { productId: product.id },
          orderBy: { reviewDate: "desc" },
        });
        const reviewCount = await prisma.review.count({
          where: { productId: product.id },
        });

        await prisma.product.update({
          where: { id: product.id },
          data: {
            latestReviewDate: latestReview?.reviewDate,
            totalReviewCount: reviewCount,
          },
        });

        productsAdded++;
      } catch (err) {
        errors.push(
          `Failed to sync product ${extProduct.asin}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    return { productsAdded, reviewsAdded, errors };
  },
};
