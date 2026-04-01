// src/app/api/kpis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { KpiStats } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = req.nextUrl;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const products = await prisma.product.findMany({
    where: { userId },
    select: { id: true, amazonRating: true },
  });

  const productIds = products.map((p) => p.id);

  const avgRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + p.amazonRating, 0) / products.length
      : 0;

  const dateFilter =
    dateFrom || dateTo
      ? {
          reviewDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {};

  const [totalReviews, newReviews] = await Promise.all([
    prisma.review.count({
      where: { productId: { in: productIds }, ...dateFilter },
    }),
    dateFrom
      ? prisma.review.count({
          where: {
            productId: { in: productIds },
            reviewDate: { gte: new Date(dateFrom) },
          },
        })
      : Promise.resolve(0),
  ]);

  const stats: KpiStats = {
    totalAsins: products.length,
    avgRating,
    totalReviews,
    newReviewsSinceFrom: newReviews,
  };

  return NextResponse.json(stats);
}
