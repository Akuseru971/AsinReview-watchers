// src/components/dashboard/sync-button.tsx
"use client";

import { useSync } from "@/hooks/use-sync";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export function SyncButton() {
  const { mutate, isPending, isSuccess, isError } = useSync();
  const [result, setResult] = useState<{
    reviewsAdded?: number;
    productsAdded?: number;
  } | null>(null);

  const handleSync = () => {
    setResult(null);
    mutate(undefined, {
      onSuccess: (data) => setResult(data),
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        onClick={handleSync}
        loading={isPending}
        disabled={isPending}
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Syncing…" : "Sync Reviews"}
      </Button>

      {isSuccess && result && (
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {result.reviewsAdded} reviews, {result.productsAdded} products synced
        </span>
      )}

      {isError && (
        <span className="flex items-center gap-1.5 text-xs text-red-400">
          <XCircle className="h-3.5 w-3.5" />
          Sync failed
        </span>
      )}
    </div>
  );
}
