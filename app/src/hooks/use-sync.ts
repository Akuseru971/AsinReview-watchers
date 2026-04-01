"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type SyncPayload = {
  input?: string;
  marketplace?: string;
  latestOnly?: boolean;
};

export function useSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: SyncPayload) =>
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      }).then((r) => {
        if (!r.ok) throw new Error("Sync failed");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
