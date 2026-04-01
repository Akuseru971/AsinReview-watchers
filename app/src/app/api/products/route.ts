// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importAsinsSchema, productFiltersSchema } from "@/lib/validation";
import type { ProductRow } from "@/types";

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

function extractAsins(input: string) {
  const tokens = input
    .toUpperCase()
    .split(/[\s,;|\n\r\t]+/)
    .map((v) => v.trim())
    .filter(Boolean);

  const valid = new Set<string>();
  const invalid = new Set<string>();

  for (const token of tokens) {
    if (/^[A-Z0-9]{10}$/.test(token)) {
      valid.add(token);
    } else {
      invalid.add(token);
    }
  }

  return {
    valid: Array.from(valid),
    invalid: Array.from(invalid),
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      userId: session.user.id,
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = importAsinsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const marketplaceCode = parsed.data.marketplace.toUpperCase();
  const marketplaceMeta =
    MARKETPLACE_META[marketplaceCode] ?? {
      name: marketplaceCode,
      domain: `amazon.${marketplaceCode.toLowerCase()}`,
    };

  const marketplace = await prisma.marketplace.upsert({
    where: { code: marketplaceCode },
    update: {
      name: marketplaceMeta.name,
      domain: marketplaceMeta.domain,
    },
    create: {
      code: marketplaceCode,
      name: marketplaceMeta.name,
      domain: marketplaceMeta.domain,
    },
  });

  const { valid, invalid } = extractAsins(parsed.data.input);
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

  const existing = await prisma.product.findMany({
    where: {
      userId: session.user.id,
      marketplaceId: marketplace.id,
      asin: { in: valid },
    },
    select: { asin: true },
  });

  const existingSet = new Set(existing.map((p) => p.asin));
  const toCreate = valid.filter((asin) => !existingSet.has(asin));

  if (toCreate.length > 0) {
    await prisma.product.createMany({
      data: toCreate.map((asin) => ({
        userId: session.user.id,
        marketplaceId: marketplace.id,
        asin,
        title: `ASIN ${asin}`,
        amazonRating: 0,
        totalReviewCount: 0,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({
    created: toCreate.length,
    skipped: valid.length - toCreate.length,
    invalid,
    marketplace: marketplace.code,
  });
}
