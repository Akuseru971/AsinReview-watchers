// src/app/(dashboard)/dashboard/products/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { ReviewList } from "@/components/dashboard/review-list";
import { RatingDistribution } from "@/components/dashboard/rating-distribution";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/dashboard/export-button";
import { ArrowLeft, Package2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const sp = await searchParams;

  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: { marketplace: true },
  });

  if (!product) notFound();

  // Rating distribution
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId: id },
    _count: { rating: true },
  });

  const distMap = Object.fromEntries(
    distribution.map((d) => [d.rating, d._count.rating])
  ) as Record<number, number>;

  const totalDist = Object.values(distMap).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={product.asin}
        subtitle={product.title}
        showSync
      />

      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ASINs
        </Link>

        {/* Product header card */}
        <Card className="p-5">
          <div className="flex items-start gap-5">
            {product.imageUrl ? (
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="96px"
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-slate-700 flex items-center justify-center">
                <Package2 className="h-8 w-8 text-slate-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="rounded bg-slate-700 px-1.5 py-0.5 text-sm text-blue-300 font-mono">
                  {product.asin}
                </code>
                <Badge variant="info">{product.marketplace.code}</Badge>
              </div>
              <h2 className="mt-1.5 text-lg font-semibold text-white leading-snug">
                {product.title}
              </h2>
              <div className="mt-2 flex items-center gap-4 flex-wrap">
                <StarRating
                  rating={product.amazonRating}
                  showValue
                  size="md"
                />
                <span className="text-sm text-slate-400">
                  {product.totalReviewCount.toLocaleString()} reviews
                </span>
                {product.latestReviewDate && (
                  <span className="text-xs text-slate-500">
                    Latest:{" "}
                    {new Date(product.latestReviewDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <ExportButton productId={id} filters={{ dateFrom: sp.dateFrom, dateTo: sp.dateTo }} />
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Rating distribution */}
          <Card>
            <CardHeader>
              <span className="text-sm font-medium text-slate-300">
                Rating Distribution
              </span>
            </CardHeader>
            <CardContent>
              <RatingDistribution distribution={distMap} total={totalDist} />
            </CardContent>
          </Card>

          {/* Trend */}
          <Card>
            <CardHeader>
              <span className="text-sm font-medium text-slate-300">
                Review Trend (weekly)
              </span>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              <Suspense fallback={<Skeleton className="h-56" />}>
                <TrendChart productId={id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-slate-300">Reviews</span>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              }
            >
              <ReviewList
                productId={id}
                initialDateFrom={sp.dateFrom}
                initialDateTo={sp.dateTo}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
