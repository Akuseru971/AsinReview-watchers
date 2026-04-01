"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Upload, RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";

type SyncResult = {
  created?: number;
  skipped?: number;
  invalid?: string[];
  invalidAsins?: string[];
  marketplace?: string;
  productsAdded?: number;
  reviewsAdded?: number;
  errors?: string[];
  message?: string;
};

const MARKET_OPTIONS = ["BR", "US", "UK", "DE", "FR", "IT", "ES", "CA", "JP", "IN", "AU"];

export function AsinImportCard() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [marketplace, setMarketplace] = useState("BR");
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncMutation = useMutation({
    mutationFn: async (latestOnly: boolean) => {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, marketplace, latestOnly }),
      });

      const data = (await response.json()) as SyncResult;
      if (!response.ok) {
        throw new Error(data?.message ?? "Sync failed");
      }

      return data;
    },
    onSuccess: (result) => {
      setErrorMessage(null);
      setLastResult(result);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      setLastResult(null);
      setErrorMessage(error instanceof Error ? error.message : "Sync failed");
    },
  });

  const disabled = syncMutation.isPending || input.trim().length === 0;

  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-slate-300">ASIN Input</span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-xs text-slate-400">
            Enter one ASIN or paste multiple ASINs (comma, space, or line break). The system will automatically fetch product metadata and reviews.
          </p>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="B08N5WRWNW\nB07FZ8S74R"
            rows={5}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors duration-150"
          />

          <div className="grid gap-3 sm:grid-cols-[180px_1fr_1fr] sm:items-end">
            <Select
              label="Marketplace"
              value={marketplace}
              onChange={(event) => setMarketplace(event.target.value)}
            >
              {MARKET_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>

            <Button
              type="button"
              onClick={() => syncMutation.mutate(false)}
              loading={syncMutation.isPending}
              disabled={disabled}
            >
              <Upload className="h-4 w-4" />
              Fetch reviews
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => syncMutation.mutate(true)}
              loading={syncMutation.isPending}
              disabled={disabled}
            >
              <RefreshCcw className="h-4 w-4" />
              Sync latest reviews
            </Button>
          </div>

          {lastResult && (
            <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-3 text-sm text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Sync completed on {marketplace}
              </div>
              <p>
                Products processed: {lastResult.productsAdded ?? 0} | Reviews upserted: {lastResult.reviewsAdded ?? 0}
              </p>
              {(lastResult.invalidAsins ?? []).length > 0 && (
                <p className="text-amber-300">
                  Invalid ignored: {(lastResult.invalidAsins ?? []).slice(0, 10).join(", ")}
                  {(lastResult.invalidAsins ?? []).length > 10 ? "..." : ""}
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-red-700/40 bg-red-900/20 p-3 text-sm text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
