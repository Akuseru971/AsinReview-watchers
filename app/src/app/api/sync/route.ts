import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseAsinInput,
  syncMultipleAsins,
  syncTrackedAsinsLatest,
} from "@/lib/ingestion/review-ingestion-service";

type SyncPayload = {
  input?: string;
  marketplace?: string;
  latestOnly?: boolean;
};

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => ({}))) as SyncPayload;
  const latestOnly = Boolean(payload.latestOnly);
  const marketplace = (payload.marketplace ?? "BR").toUpperCase();

  const log = await prisma.syncLog.create({
    data: { status: "running" },
  });

  try {
    const hasManualInput = typeof payload.input === "string" && payload.input.trim().length > 0;
    const parsedManualInput = hasManualInput
      ? parseAsinInput(payload.input as string)
      : { valid: [], invalid: [] };

    const result = hasManualInput
      ? await syncMultipleAsins({
          asins: parsedManualInput.valid,
          marketplace,
          latestOnly,
        })
      : await syncTrackedAsinsLatest();

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: result.errors.length > 0 ? "error" : "success",
        message: result.errors.length > 0 ? result.errors.join("\n") : null,
        reviewsAdded: result.reviewsAdded,
        productsAdded: result.productsAdded,
        finishedAt: new Date(),
      },
    });

    const extraInvalidAsins = (result as { invalidAsins?: string[] }).invalidAsins ?? [];

    return NextResponse.json({
      success: true,
      reviewsAdded: result.reviewsAdded,
      productsAdded: result.productsAdded,
      invalidAsins: [...parsedManualInput.invalid, ...extraInvalidAsins],
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
