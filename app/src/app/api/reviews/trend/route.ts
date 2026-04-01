// src/app/api/reviews/trend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = req.nextUrl;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const productId = searchParams.get("productId");

  const productIds = productId
    ? [productId]
    : (
        await prisma.product.findMany({
          where: { userId },
          select: { id: true },
        })
      ).map((p) => p.id);

  const reviews = await prisma.review.findMany({
    where: {
      productId: { in: productIds },
      ...(dateFrom || dateTo
        ? {
            reviewDate: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    },
    select: { reviewDate: true, rating: true },
    orderBy: { reviewDate: "asc" },
  });

  // Group by week (ISO week string: YYYY-Www)
  const weeks = new Map<string, { count: number; ratingSum: number }>();
  for (const r of reviews) {
    const d = new Date(r.reviewDate);
    const year = d.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const week = Math.ceil(
      ((d.getTime() - startOfYear.getTime()) / 86400000 +
        startOfYear.getDay() +
        1) /
        7
    );
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    const existing = weeks.get(key) ?? { count: 0, ratingSum: 0 };
    weeks.set(key, {
      count: existing.count + 1,
      ratingSum: existing.ratingSum + r.rating,
    });
  }

  const trend = Array.from(weeks.entries()).map(([week, v]) => ({
    week,
    count: v.count,
    avgRating: v.ratingSum / v.count,
  }));

  return NextResponse.json(trend);
}
