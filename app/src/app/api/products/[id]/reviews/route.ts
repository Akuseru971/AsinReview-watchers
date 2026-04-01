import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewFiltersSchema } from "@/lib/validation";
import type { ReviewRow } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = req.nextUrl;
  const parsed = reviewFiltersSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    dateFrom,
    dateTo,
    minRating,
    maxRating,
    keyword,
    marketplace,
    verifiedOnly,
    page,
    pageSize,
  } = parsed.data;

  const where = {
    productId: id,
    ...(dateFrom || dateTo
      ? {
          reviewDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
    ...(minRating !== undefined || maxRating !== undefined
      ? {
          rating: {
            ...(minRating !== undefined && { gte: minRating }),
            ...(maxRating !== undefined && { lte: maxRating }),
          },
        }
      : {}),
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: "insensitive" as const } },
        { body: { contains: keyword, mode: "insensitive" as const } },
      ],
    }),
    ...(marketplace && { marketplace: { code: marketplace } }),
    ...(verifiedOnly && { verifiedPurchase: true }),
  };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: { marketplace: true, product: true },
      orderBy: { reviewDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const rows: ReviewRow[] = reviews.map((r) => ({
    id: r.id,
    productId: r.productId,
    asin: r.product.asin,
    productTitle: r.product.title,
    rating: r.rating,
    title: r.title,
    body: r.body,
    reviewerName: r.reviewerName,
    reviewDate: r.reviewDate.toISOString(),
    verifiedPurchase: r.verifiedPurchase,
    marketplace: r.marketplace?.code ?? null,
    sentiment: r.sentiment as ReviewRow["sentiment"],
  }));

  return NextResponse.json({
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
