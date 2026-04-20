"use client";

import { useQuery } from "@tanstack/react-query";
import type { MemberSession } from "@/types";

export function useMemberSession() {
  return useQuery<MemberSession>({
    queryKey: ["member", "session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}
