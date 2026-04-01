// src/app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportParamsSchema } from "@/lib/validation";
import {
  buildExcelExport,
  buildCsvExport,
  buildExportFilename,
  buildCsvFilename,
} from "@/lib/export";
import type { ProductRow, ReviewRow } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "xlsx";

  const parsed = exportParamsSchema.safeParse(
    Object.fromEntries(searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    productId,
    dateFrom,
    dateTo,
    minRating,
    maxRating,
    keyword,
    marketplace,
    verifiedOnly,
  } = parsed.data;

  const reviewWhere = {
    product: { userId },
    ...(productId && { productId }),
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

  const [products, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { userId, ...(productId && { id: productId }) },
      include: { marketplace: true },
    }),
    prisma.review.findMany({
      where: reviewWhere,
      include: { marketplace: true, product: true },
      orderBy: { reviewDate: "desc" },
    }),
  ]);

  const productRows: ProductRow[] = products.map((p) => ({
    id: p.id,
    asin: p.asin,
    title: p.title,
    imageUrl: p.imageUrl,
    amazonRating: p.amazonRating,
    totalReviewCount: p.totalReviewCount,
    latestReviewDate: p.latestReviewDate?.toISOString() ?? null,
    marketplace: { code: p.marketplace.code, name: p.marketplace.name },
  }));

  const reviewRows: ReviewRow[] = reviews.map((r) => ({
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

  const from = dateFrom ?? "all";
  const to = dateTo ?? "all";

  if (format === "csv") {
    const csv = buildCsvExport(reviewRows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${buildCsvFilename(from, to)}"`,
      },
    });
  }

  const buffer = await buildExcelExport({
    products: productRows,
    reviews: reviewRows,
    dateFrom: from,
    dateTo: to,
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${buildExportFilename(from, to)}"`,
    },
  });
}
