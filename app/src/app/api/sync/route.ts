// src/app/api/sync/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activeConnector } from "@/lib/connectors";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Create sync log entry
  const log = await prisma.syncLog.create({
    data: { userId, status: "running" },
  });

  try {
    const result = await activeConnector.syncReviews(userId);

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: result.errors.length > 0 ? "error" : "success",
        message:
          result.errors.length > 0 ? result.errors.join("\n") : null,
        reviewsAdded: result.reviewsAdded,
        productsAdded: result.productsAdded,
        finishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      reviewsAdded: result.reviewsAdded,
      productsAdded: result.productsAdded,
      errors: result.errors,
    });
  } catch (err) {
    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        finishedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: "Sync failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
