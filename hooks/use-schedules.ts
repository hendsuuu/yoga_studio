"use client";

import { useQuery } from "@tanstack/react-query";
import type { Schedule } from "@/types";

export function useSchedules() {
  return useQuery<Schedule[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await fetch("/api/schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
  });
}
