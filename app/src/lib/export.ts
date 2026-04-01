// src/lib/export.ts
// Excel & CSV export utilities

import ExcelJS from "exceljs";
import { format } from "date-fns";
import type { ProductRow, ReviewRow } from "@/types";

export interface ExportPayload {
  products: ProductRow[];
  reviews: ReviewRow[];
  dateFrom: string;
  dateTo: string;
}

// ─── Excel export ───────────────────────────────────────────────────────────

export async function buildExcelExport(payload: ExportPayload): Promise<Buffer> {
  const { products, reviews, dateFrom, dateTo } = payload;

  const wb = new ExcelJS.Workbook();
  wb.creator = "AsinReview Watchers";
  wb.created = new Date();

  // ── Sheet 1 – ASIN Summary ──────────────────────────────────────────────
  const summarySheet = wb.addWorksheet("ASIN Summary");
  summarySheet.columns = [
    { header: "ASIN", key: "asin", width: 16 },
    { header: "Product Title", key: "title", width: 55 },
    { header: "Amazon Rating", key: "amazonRating", width: 16 },
    { header: "Total Review Count", key: "totalReviewCount", width: 20 },
    { header: "Latest Review Date", key: "latestReviewDate", width: 22 },
    { header: "Reviews Included In Export", key: "reviewsIncluded", width: 28 },
  ];

  styleHeaderRow(summarySheet);

  for (const p of products) {
    const reviewsIncluded = reviews.filter((r) => r.productId === p.id).length;
    summarySheet.addRow({
      asin: p.asin,
      title: p.title,
      amazonRating: p.amazonRating,
      totalReviewCount: p.totalReviewCount,
      latestReviewDate: p.latestReviewDate
        ? format(new Date(p.latestReviewDate), "yyyy-MM-dd")
        : "",
      reviewsIncluded,
    });
  }

  // ── Sheet 2 – Reviews ───────────────────────────────────────────────────
  const reviewSheet = wb.addWorksheet("Reviews");
  reviewSheet.columns = [
    { header: "ASIN", key: "asin", width: 16 },
    { header: "Product Title", key: "productTitle", width: 50 },
    { header: "Review Date", key: "reviewDate", width: 16 },
    { header: "Rating", key: "rating", width: 10 },
    { header: "Review Title", key: "title", width: 45 },
    { header: "Review Body", key: "body", width: 80 },
    { header: "Reviewer Name", key: "reviewerName", width: 22 },
    { header: "Marketplace", key: "marketplace", width: 14 },
    { header: "Verified Purchase", key: "verifiedPurchase", width: 18 },
    { header: "Sentiment", key: "sentiment", width: 14 },
  ];

  styleHeaderRow(reviewSheet);

  for (const r of reviews) {
    const row = reviewSheet.addRow({
      asin: r.asin,
      productTitle: r.productTitle,
      reviewDate: format(new Date(r.reviewDate), "yyyy-MM-dd"),
      rating: r.rating,
      title: r.title ?? "",
      body: r.body ?? "",
      reviewerName: r.reviewerName ?? "",
      marketplace: r.marketplace ?? "",
      verifiedPurchase: r.verifiedPurchase ? "Yes" : "No",
      sentiment: r.sentiment ?? "",
    });

    // Wrap text in body cell
    const bodyCell = row.getCell("body");
    bodyCell.alignment = { wrapText: true, vertical: "top" };

    // Color-code rating
    const ratingCell = row.getCell("rating");
    if (r.rating >= 4) ratingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD4EDDA" } };
    else if (r.rating === 3) ratingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF3CD" } };
    else ratingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8D7DA" } };
  }

  // ── Sheet 3 – Metadata ──────────────────────────────────────────────────
  const metaSheet = wb.addWorksheet("Export Info");
  metaSheet.addRow(["Export Date", format(new Date(), "yyyy-MM-dd HH:mm:ss")]);
  metaSheet.addRow(["Date Range From", dateFrom]);
  metaSheet.addRow(["Date Range To", dateTo]);
  metaSheet.addRow(["Total ASINs", products.length]);
  metaSheet.addRow(["Total Reviews Exported", reviews.length]);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

// ─── CSV export ─────────────────────────────────────────────────────────────

export function buildCsvExport(reviews: ReviewRow[]): string {
  const headers = [
    "ASIN",
    "Product Title",
    "Review Date",
    "Rating",
    "Review Title",
    "Review Body",
    "Reviewer Name",
    "Marketplace",
    "Verified Purchase",
    "Sentiment",
  ];

  const escape = (v: string | null | undefined | number | boolean): string => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = reviews.map((r) =>
    [
      r.asin,
      r.productTitle,
      format(new Date(r.reviewDate), "yyyy-MM-dd"),
      r.rating,
      r.title,
      r.body,
      r.reviewerName,
      r.marketplace,
      r.verifiedPurchase ? "Yes" : "No",
      r.sentiment,
    ]
      .map(escape)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF4A90D9" } },
    };
  });
  headerRow.height = 20;
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

export function buildExportFilename(dateFrom: string, dateTo: string): string {
  return `amazon_reviews_export_${dateFrom}_to_${dateTo}.xlsx`;
}

export function buildCsvFilename(dateFrom: string, dateTo: string): string {
  return `amazon_reviews_export_${dateFrom}_to_${dateTo}.csv`;
}
