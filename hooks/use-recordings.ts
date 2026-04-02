"use client";

import { useQuery } from "@tanstack/react-query";
import type { Recording } from "@/types";

export function useRecordings() {
  return useQuery<Recording[]>({
    queryKey: ["recordings"],
    queryFn: async () => {
      const res = await fetch("/api/recordings");
      if (!res.ok) throw new Error("Failed to fetch recordings");
      return res.json();
    },
  });
}
