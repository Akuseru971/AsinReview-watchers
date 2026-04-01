// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { importAsinsSchema, productFiltersSchema } from "@/lib/validation";
import {
  parseAsinInput,
  syncMultipleAsins,
} from "@/lib/ingestion/review-ingestion-service";
import type { ProductRow } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const parsed = productFiltersSchema.safeParse(
    Object.fromEntries(searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { search, sort, marketplace, dateFrom, dateTo } = parsed.data;

  const orderBy = (() => {
    switch (sort) {
      case "rating_desc":
        return { amazonRating: "desc" as const };
      case "rating_asc":
        return { amazonRating: "asc" as const };
      case "review_count_desc":
        return { totalReviewCount: "desc" as const };
      default:
        return { latestReviewDate: "desc" as const };
    }
  })();

  const products = await prisma.product.findMany({
    where: {
      ...(marketplace && { marketplace: { code: marketplace } }),
      ...(search && {
        OR: [
          { asin: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { marketplace: true },
    orderBy,
  });

  // Compute per-product review counts within the date range if provided
  const dateFilter =
    dateFrom || dateTo
      ? {
          reviewDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : undefined;

  const rows: ProductRow[] = await Promise.all(
    products.map(async (p) => {
      const reviewsInRange = dateFilter
        ? await prisma.review.count({
            where: { productId: p.id, ...dateFilter },
          })
        : p.totalReviewCount;

      return {
        id: p.id,
        asin: p.asin,
        title: p.title,
        imageUrl: p.imageUrl,
        amazonRating: p.amazonRating,
        totalReviewCount: reviewsInRange,
        latestReviewDate: p.latestReviewDate?.toISOString() ?? null,
        marketplace: { code: p.marketplace.code, name: p.marketplace.name },
      };
    })
  );

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = importAsinsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { valid, invalid } = parseAsinInput(parsed.data.input);
  if (valid.length === 0) {
    return NextResponse.json(
      {
        created: 0,
        skipped: 0,
        invalid,
        message: "No valid ASIN found. Expected 10 alphanumeric characters.",
      },
      { status: 400 }
    );
  }

  const result = await syncMultipleAsins({
    asins: valid,
    marketplace: parsed.data.marketplace,
    latestOnly: false,
  });

  return NextResponse.json({
    created: result.productsAdded,
    skipped: valid.length - result.productsAdded,
    invalid,
    errors: result.errors,
    reviewsAdded: result.reviewsAdded,
    marketplace: parsed.data.marketplace,
  });
}
