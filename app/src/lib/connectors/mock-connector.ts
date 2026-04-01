import type { ExternalProduct, ExternalReview, ReviewConnector } from "@/types";

function seededValue(seed: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

function seededRating(asin: string) {
  return Number((3.2 + seededValue(asin, 18) / 10).toFixed(1));
}

function seededReviewCount(asin: string) {
  return 30 + seededValue(`${asin}-count`, 420);
}

function buildMockProduct(asin: string, marketplace: string): ExternalProduct {
  const category = ["Wireless Earbuds", "Coffee Maker", "Phone Case", "Fitness Watch", "Bluetooth Speaker"][
    seededValue(`${asin}-cat`, 5)
  ];

  return {
    asin,
    title: `${category} for ASIN ${asin}`,
    imageUrl: `https://picsum.photos/seed/${asin}/200/200`,
    amazonRating: seededRating(asin),
    totalReviewCount: seededReviewCount(asin),
    marketplace,
  };
}

function buildMockReviews(asin: string, marketplace: string, options?: { since?: Date }): ExternalReview[] {
  const baseCount = 20 + seededValue(`${asin}-reviews`, 18);
  const now = Date.now();
  const list: ExternalReview[] = [];

  for (let i = 0; i < baseCount; i++) {
    const offsetDays = seededValue(`${asin}-${i}-days`, 240);
    const reviewDate = new Date(now - offsetDays * 24 * 60 * 60 * 1000);

    if (options?.since && reviewDate <= options.since) {
      continue;
    }

    const rating = 1 + seededValue(`${asin}-${i}-rating`, 5);
    const sentimentWord = rating >= 4 ? "Great" : rating === 3 ? "Average" : "Poor";

    list.push({
      reviewExternalId: `${asin}-${marketplace}-${i}`,
      rating,
      title: `${sentimentWord} experience #${i + 1}`,
      body: `Auto-generated mock review for ${asin} on ${marketplace}. This simulates ingestion from an external provider.`,
      reviewerName: `Reviewer ${1 + seededValue(`${asin}-${i}-reviewer`, 800)}`,
      reviewDate,
      verifiedPurchase: seededValue(`${asin}-${i}-verified`, 2) === 1,
      marketplace,
    });
  }

  return list.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
}

export const mockConnector: ReviewConnector = {
  async discoverProductByAsin(asin: string) {
    return /^[A-Z0-9]{10}$/.test(asin.toUpperCase());
  },

  async fetchProductMetadata(asin: string, marketplace: string) {
    if (!/^[A-Z0-9]{10}$/.test(asin.toUpperCase())) {
      return null;
    }

    return buildMockProduct(asin.toUpperCase(), marketplace.toUpperCase());
  },

  async fetchReviewsByAsin(asin: string, marketplace: string, options?: { since?: Date }) {
    return buildMockReviews(asin.toUpperCase(), marketplace.toUpperCase(), options);
  },
};
