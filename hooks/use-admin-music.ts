"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MusicTrack } from "@/types";

const KEY = ["admin", "music"];

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

export function useAdminMusic() {
  return useQuery<MusicTrack[]>({
    queryKey: KEY,
    queryFn: () => apiFetch("/api/admin/music"),
  });
}

export function useCreateMusic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MusicTrack, "id" | "isActive">) =>
      apiFetch("/api/admin/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateMusic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiFetch(`/api/admin/music/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteMusic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/music/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
