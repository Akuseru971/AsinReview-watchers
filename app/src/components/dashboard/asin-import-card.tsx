"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";

type ImportResult = {
  created: number;
  skipped: number;
  invalid: string[];
  marketplace: string;
  message?: string;
};

const MARKET_OPTIONS = ["BR", "US", "UK", "DE", "FR", "IT", "ES", "CA", "JP", "IN", "AU"];

export function AsinImportCard() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [marketplace, setMarketplace] = useState("BR");
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, marketplace }),
      });

      const data = (await response.json()) as ImportResult | { error?: unknown; message?: string };
      if (!response.ok) {
        const message =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string"
            ? data.message
            : null) ?? "Import failed";
        throw new Error(message);
      }

      return data as ImportResult;
    },
    onSuccess: (result) => {
      setErrorMessage(null);
      setLastResult(result);
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
    },
    onError: (error) => {
      setLastResult(null);
      setErrorMessage(error instanceof Error ? error.message : "Import failed");
    },
  });

  const disabled = importMutation.isPending || input.trim().length === 0;

  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-slate-300">Import ASINs</span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-xs text-slate-400">
            Paste one or multiple ASINs (comma, space, or line break separated), then choose a marketplace.
          </p>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="B08N5WRWNW, B07FZ8S74R"
            rows={5}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors duration-150"
          />

          <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-end">
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
              onClick={() => importMutation.mutate()}
              loading={importMutation.isPending}
              disabled={disabled}
            >
              <Upload className="h-4 w-4" />
              Import ASINs
            </Button>
          </div>

          {lastResult && (
            <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-3 text-sm text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Import completed on {lastResult.marketplace}
              </div>
              <p>Created: {lastResult.created} | Skipped: {lastResult.skipped}</p>
              {lastResult.invalid.length > 0 && (
                <p className="text-amber-300">
                  Invalid ignored: {lastResult.invalid.slice(0, 10).join(", ")}
                  {lastResult.invalid.length > 10 ? "..." : ""}
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
