import { PrismaClient } from "@prisma/client";
import { sentimentFromRating } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const marketplaces = await Promise.all([
    prisma.marketplace.upsert({
      where: { code: "BR" },
      update: {},
      create: { code: "BR", name: "Amazon Brazil", domain: "amazon.com.br" },
    }),
    prisma.marketplace.upsert({
      where: { code: "US" },
      update: {},
      create: { code: "US", name: "Amazon US", domain: "amazon.com" },
    }),
  ]);

  const br = marketplaces[0];

  const productSeeds = [
    {
      asin: "B08N5WRWNW",
      title: "Echo Dot (4th Gen) Smart Speaker with Alexa",
      imageUrl: "https://m.media-amazon.com/images/I/61u4HxVONUL._AC_SL1000_.jpg",
      amazonRating: 4.7,
      totalReviewCount: 312485,
    },
    {
      asin: "B07XJ8C8F5",
      title: "Fire TV Stick 4K streaming device",
      imageUrl: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg",
      amazonRating: 4.6,
      totalReviewCount: 289034,
    },
    {
      asin: "B09B93ZDG4",
      title: "Kindle Paperwhite (16 GB)",
      imageUrl: "https://m.media-amazon.com/images/I/61FBaGLDJ+L._AC_SL1000_.jpg",
      amazonRating: 4.8,
      totalReviewCount: 98234,
    },
  ];

  const products = [];
  for (const seed of productSeeds) {
    const product = await prisma.product.upsert({
      where: {
        asin_marketplaceId: {
          asin: seed.asin,
          marketplaceId: br.id,
        },
      },
      update: {
        title: seed.title,
        imageUrl: seed.imageUrl,
        amazonRating: seed.amazonRating,
        totalReviewCount: seed.totalReviewCount,
      },
      create: {
        asin: seed.asin,
        title: seed.title,
        imageUrl: seed.imageUrl,
        amazonRating: seed.amazonRating,
        totalReviewCount: seed.totalReviewCount,
        marketplaceId: br.id,
      },
    });

    products.push(product);
  }

  const reviewBodies = {
    positive: [
      "Great product, quality is excellent.",
      "Very happy with this purchase.",
      "Works perfectly and arrived fast.",
    ],
    neutral: [
      "It is fine for the price.",
      "Average experience, acceptable.",
      "Not bad, not amazing.",
    ],
    negative: [
      "Disappointed with durability.",
      "Stopped working too quickly.",
      "Not what I expected.",
    ],
  };

  const reviewers = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fabio"];

  for (const product of products) {
    for (let i = 0; i < 40; i++) {
      const rating = 1 + Math.floor(Math.random() * 5);
      const daysAgo = Math.floor(Math.random() * 365);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - daysAgo);

      const bodies =
        rating >= 4
          ? reviewBodies.positive
          : rating === 3
          ? reviewBodies.neutral
          : reviewBodies.negative;

      await prisma.review.upsert({
        where: {
          productId_reviewExternalId: {
            productId: product.id,
            reviewExternalId: `seed-${product.asin}-${i}`,
          },
        },
        update: {},
        create: {
          productId: product.id,
          reviewExternalId: `seed-${product.asin}-${i}`,
          rating,
          title: `Review ${i + 1}`,
          body: bodies[Math.floor(Math.random() * bodies.length)],
          reviewerName: reviewers[Math.floor(Math.random() * reviewers.length)],
          reviewDate,
          verifiedPurchase: Math.random() > 0.35,
          marketplaceId: br.id,
          sentiment: sentimentFromRating(rating),
        },
      });
    }

    const [latest, count] = await Promise.all([
      prisma.review.findFirst({
        where: { productId: product.id },
        orderBy: { reviewDate: "desc" },
      }),
      prisma.review.count({ where: { productId: product.id } }),
    ]);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        latestReviewDate: latest?.reviewDate,
        totalReviewCount: count,
      },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
