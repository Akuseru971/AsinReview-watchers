// prisma/seed.ts
// Run: npx prisma db seed

import { PrismaClient } from "@prisma/client";
import { sentimentFromRating } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // ── Marketplaces ──────────────────────────────────────────────────────────
  const marketplaces = await Promise.all([
    prisma.marketplace.upsert({
      where: { code: "US" },
      update: {},
      create: { code: "US", name: "Amazon.com", domain: "amazon.com" },
    }),
    prisma.marketplace.upsert({
      where: { code: "FR" },
      update: {},
      create: { code: "FR", name: "Amazon.fr", domain: "amazon.fr" },
    }),
    prisma.marketplace.upsert({
      where: { code: "DE" },
      update: {},
      create: { code: "DE", name: "Amazon.de", domain: "amazon.de" },
    }),
    prisma.marketplace.upsert({
      where: { code: "UK" },
      update: {},
      create: { code: "UK", name: "Amazon.co.uk", domain: "amazon.co.uk" },
    }),
  ]);

  const us = marketplaces[0];
  console.log(`✅ ${marketplaces.length} marketplaces ready`);

  // ── Demo user ─────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });
  console.log(`✅ Demo user: ${user.email}`);

  // ── Products ──────────────────────────────────────────────────────────────
  const productSeeds = [
    {
      asin: "B08N5WRWNW",
      title: "Echo Dot (4th Gen) Smart Speaker with Alexa – Charcoal",
      imageUrl:
        "https://m.media-amazon.com/images/I/61u4HxVONUL._AC_SL1000_.jpg",
      amazonRating: 4.7,
      totalReviewCount: 312485,
    },
    {
      asin: "B07XJ8C8F5",
      title: "Fire TV Stick 4K streaming device with Alexa Voice Remote",
      imageUrl:
        "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg",
      amazonRating: 4.6,
      totalReviewCount: 289034,
    },
    {
      asin: "B09B93ZDG4",
      title: "Kindle Paperwhite (16 GB) – 6.8\" display, adjustable warm light",
      imageUrl:
        "https://m.media-amazon.com/images/I/61FBaGLDJ+L._AC_SL1000_.jpg",
      amazonRating: 4.8,
      totalReviewCount: 98234,
    },
    {
      asin: "B07PXGQC1Q",
      title: "AmazonBasics Neoprene Classic Dumbbell Hand Weights",
      imageUrl:
        "https://m.media-amazon.com/images/I/81j11z+NHAL._AC_SL1500_.jpg",
      amazonRating: 4.5,
      totalReviewCount: 45210,
    },
    {
      asin: "B0BVZNJLCC",
      title: "Anker Soundcore Life Q30 Hybrid Active Noise Cancelling Headphones",
      imageUrl:
        "https://m.media-amazon.com/images/I/71YwrWDSqhL._AC_SL1500_.jpg",
      amazonRating: 4.4,
      totalReviewCount: 61000,
    },
  ];

  const products = [];
  for (const seed of productSeeds) {
    const p = await prisma.product.upsert({
      where: {
        userId_asin_marketplaceId: {
          userId: user.id,
          asin: seed.asin,
          marketplaceId: us.id,
        },
      },
      update: {
        title: seed.title,
        imageUrl: seed.imageUrl,
        amazonRating: seed.amazonRating,
        totalReviewCount: seed.totalReviewCount,
      },
      create: {
        userId: user.id,
        asin: seed.asin,
        title: seed.title,
        imageUrl: seed.imageUrl,
        amazonRating: seed.amazonRating,
        totalReviewCount: seed.totalReviewCount,
        marketplaceId: us.id,
      },
    });
    products.push(p);
  }
  console.log(`✅ ${products.length} products seeded`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  const reviewBodies = {
    positive: [
      "Absolutely love this product! Works perfectly and exceeded my expectations.",
      "Best purchase I've made this year. Highly recommended to everyone.",
      "Great quality for the price. Very happy with this purchase.",
      "Setup was incredibly easy and the performance is outstanding.",
      "This is exactly what I was looking for. Five stars!",
    ],
    neutral: [
      "It's okay, does the job. Nothing exceptional but works as advertised.",
      "Average product, nothing special. Would probably buy again though.",
      "Works as described. Meets basic expectations.",
      "Pretty good but could be slightly better. Overall satisfied.",
      "Decent quality. Some minor issues but nothing deal-breaking.",
    ],
    negative: [
      "Stopped working after 2 weeks. Very disappointed with build quality.",
      "Poor quality. Not worth the money at all.",
      "Doesn't match the description. Very misleading product listing.",
      "Customer service was completely unhelpful with my issue.",
      "Would not buy again. Broke almost immediately after first use.",
    ],
  };

  const reviewers = [
    "Alice M.",
    "Bob T.",
    "Carol L.",
    "David R.",
    "Emma S.",
    "Frank B.",
    "Grace H.",
    "Henry K.",
    "Iris W.",
    "Jack P.",
    "Karen L.",
    "Liam N.",
    "Mia O.",
    "Noah P.",
    "Olivia Q.",
  ];

  let totalReviews = 0;
  for (const product of products) {
    const reviews = [];
    const numReviews = 30 + Math.floor(Math.random() * 20); // 30–50 per product

    for (let i = 0; i < numReviews; i++) {
      const rating = Math.floor(Math.random() * 5) + 1;
      const daysAgo = Math.floor(Math.random() * 365);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - daysAgo);

      const bodies =
        rating >= 4
          ? reviewBodies.positive
          : rating === 3
          ? reviewBodies.neutral
          : reviewBodies.negative;

      const sentiment = sentimentFromRating(rating);

      reviews.push({
        productId: product.id,
        reviewExternalId: `seed-${product.asin}-${i}`,
        rating,
        title: `${rating >= 4 ? "Great" : rating === 3 ? "Decent" : "Poor"} product — review #${i + 1}`,
        body: bodies[Math.floor(Math.random() * bodies.length)],
        reviewerName: reviewers[Math.floor(Math.random() * reviewers.length)],
        reviewDate,
        verifiedPurchase: Math.random() > 0.3,
        marketplaceId: us.id,
        sentiment,
      });
    }

    // Batch upsert
    for (const rev of reviews) {
      await prisma.review.upsert({
        where: {
          productId_reviewExternalId: {
            productId: rev.productId,
            reviewExternalId: rev.reviewExternalId,
          },
        },
        update: rev,
        create: rev,
      });
    }

    // Update product metadata
    const latest = await prisma.review.findFirst({
      where: { productId: product.id },
      orderBy: { reviewDate: "desc" },
    });
    const count = await prisma.review.count({
      where: { productId: product.id },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { latestReviewDate: latest?.reviewDate, totalReviewCount: count },
    });

    totalReviews += reviews.length;
  }

  console.log(`✅ ${totalReviews} reviews seeded`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
