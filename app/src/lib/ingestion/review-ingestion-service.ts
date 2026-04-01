import { prisma } from "@/lib/prisma";
import { sentimentFromRating } from "@/lib/utils";
import { activeConnector } from "@/lib/connectors";
import type { SyncAsinsInput, SyncResult } from "@/types";

const MARKETPLACE_META: Record<string, { name: string; domain: string }> = {
  BR: { name: "Brazil", domain: "amazon.com.br" },
  US: { name: "United States", domain: "amazon.com" },
  UK: { name: "United Kingdom", domain: "amazon.co.uk" },
  DE: { name: "Germany", domain: "amazon.de" },
  FR: { name: "France", domain: "amazon.fr" },
  IT: { name: "Italy", domain: "amazon.it" },
  ES: { name: "Spain", domain: "amazon.es" },
  CA: { name: "Canada", domain: "amazon.ca" },
  JP: { name: "Japan", domain: "amazon.co.jp" },
  IN: { name: "India", domain: "amazon.in" },
  AU: { name: "Australia", domain: "amazon.com.au" },
};

export function parseAsinInput(input: string): { valid: string[]; invalid: string[] } {
  const tokens = input
    .toUpperCase()
    .split(/[\s,;|\n\r\t]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  const valid = new Set<string>();
  const invalid = new Set<string>();

  for (const token of tokens) {
    if (/^[A-Z0-9]{10}$/.test(token)) valid.add(token);
    else invalid.add(token);
  }

  return { valid: Array.from(valid), invalid: Array.from(invalid) };
}

async function resolveMarketplace(codeRaw: string) {
  const code = codeRaw.trim().toUpperCase();
  const meta = MARKETPLACE_META[code] ?? {
    name: code,
    domain: `amazon.${code.toLowerCase()}`,
  };

  return prisma.marketplace.upsert({
    where: { code },
    update: { name: meta.name, domain: meta.domain },
    create: { code, name: meta.name, domain: meta.domain },
  });
}

export async function syncMultipleAsins(
  input: SyncAsinsInput
): Promise<SyncResult & { invalidAsins: string[] }> {
  const marketplace = await resolveMarketplace(input.marketplace || "BR");
  const cleanedAsins = input.asins.map((v) => v.trim().toUpperCase()).filter(Boolean);

  let productsAdded = 0;
  let reviewsAdded = 0;
  const errors: string[] = [];
  const invalidAsins: string[] = [];

  for (const asin of cleanedAsins) {
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      invalidAsins.push(asin);
      continue;
    }

    try {
      const exists = await activeConnector.discoverProductByAsin(asin, marketplace.code);
      if (!exists) {
        errors.push(`ASIN not found on marketplace ${marketplace.code}: ${asin}`);
        continue;
      }

      const metadata = await activeConnector.fetchProductMetadata(asin, marketplace.code);
      if (!metadata) {
        errors.push(`Failed to fetch metadata for ASIN ${asin}`);
        continue;
      }

      const product = await prisma.product.upsert({
        where: {
          asin_marketplaceId: {
            asin,
            marketplaceId: marketplace.id,
          },
        },
        update: {
          title: metadata.title,
          imageUrl: metadata.imageUrl,
          amazonRating: metadata.amazonRating,
          totalReviewCount: metadata.totalReviewCount,
        },
        create: {
          asin,
          title: metadata.title,
          imageUrl: metadata.imageUrl,
          amazonRating: metadata.amazonRating,
          totalReviewCount: metadata.totalReviewCount,
          marketplaceId: marketplace.id,
        },
      });

      productsAdded += 1;

      const latest = await prisma.review.findFirst({
        where: { productId: product.id },
        orderBy: { reviewDate: "desc" },
      });

      const reviews = await activeConnector.fetchReviewsByAsin(asin, marketplace.code, {
        since: input.latestOnly ? latest?.reviewDate : undefined,
      });

      for (const review of reviews) {
        try {
          await prisma.review.upsert({
            where: {
              productId_reviewExternalId: {
                productId: product.id,
                reviewExternalId: review.reviewExternalId,
              },
            },
            update: {
              rating: review.rating,
              title: review.title,
              body: review.body,
              reviewerName: review.reviewerName,
              reviewDate: review.reviewDate,
              verifiedPurchase: review.verifiedPurchase ?? false,
              sentiment: sentimentFromRating(review.rating),
            },
            create: {
              productId: product.id,
              reviewExternalId: review.reviewExternalId,
              rating: review.rating,
              title: review.title,
              body: review.body,
              reviewerName: review.reviewerName,
              reviewDate: review.reviewDate,
              verifiedPurchase: review.verifiedPurchase ?? false,
              marketplaceId: marketplace.id,
              sentiment: sentimentFromRating(review.rating),
            },
          });
          reviewsAdded += 1;
        } catch {
          errors.push(`Failed to upsert review ${review.reviewExternalId} for ASIN ${asin}`);
        }
      }

      const [latestReview, count] = await Promise.all([
        prisma.review.findFirst({
          where: { productId: product.id },
          orderBy: { reviewDate: "desc" },
        }),
        prisma.review.count({ where: { productId: product.id } }),
      ]);

      await prisma.product.update({
        where: { id: product.id },
        data: {
          latestReviewDate: latestReview?.reviewDate,
          totalReviewCount: count,
        },
      });
    } catch (error) {
      errors.push(`Failed to sync ${asin}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { productsAdded, reviewsAdded, errors, invalidAsins };
}

export async function syncTrackedAsinsLatest(): Promise<SyncResult> {
  const products = await prisma.product.findMany({
    select: { asin: true, marketplace: { select: { code: true } } },
  });

  if (products.length === 0) {
    return { productsAdded: 0, reviewsAdded: 0, errors: [] };
  }

  const grouped = new Map<string, string[]>();
  for (const product of products) {
    const market = product.marketplace.code;
    const list = grouped.get(market) ?? [];
    list.push(product.asin);
    grouped.set(market, list);
  }

  let productsAdded = 0;
  let reviewsAdded = 0;
  const errors: string[] = [];

  for (const [marketplace, asins] of grouped.entries()) {
    const result = await syncMultipleAsins({ asins, marketplace, latestOnly: true });
    productsAdded += result.productsAdded;
    reviewsAdded += result.reviewsAdded;
    errors.push(...result.errors);
  }

  return { productsAdded, reviewsAdded, errors };
}
