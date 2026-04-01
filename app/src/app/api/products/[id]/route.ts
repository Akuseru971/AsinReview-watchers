// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: { marketplace: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Rating distribution
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId: product.id },
    _count: { rating: true },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({
    id: product.id,
    asin: product.asin,
    title: product.title,
    imageUrl: product.imageUrl,
    amazonRating: product.amazonRating,
    totalReviewCount: product.totalReviewCount,
    latestReviewDate: product.latestReviewDate?.toISOString() ?? null,
    marketplace: {
      code: product.marketplace.code,
      name: product.marketplace.name,
    },
    ratingDistribution: distribution.reduce(
      (acc, d) => {
        acc[d.rating] = d._count.rating;
        return acc;
      },
      {} as Record<number, number>
    ),
  });
}
