// src/hooks/use-sync.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetch("/api/sync", { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error("Sync failed");
        return r.json();
      }),
    onSuccess: () => {
      // Invalidate all data after sync
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
