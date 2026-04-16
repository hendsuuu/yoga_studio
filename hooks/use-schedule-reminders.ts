"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useScheduleReminders() {
  const queryClient = useQueryClient();

  // Fetch all active reminder schedule IDs for this member
  const { data, isLoading } = useQuery<{ scheduleIds: string[] }>({
    queryKey: ["schedule-reminders"],
    queryFn: async () => {
      const res = await fetch("/api/push/reminder");
      if (!res.ok) throw new Error("Failed to fetch reminders");
      return res.json();
    },
  });

  const toggleReminder = useMutation({
    mutationFn: async (scheduleId: string) => {
      const res = await fetch("/api/push/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });
      if (!res.ok) throw new Error("Failed to toggle reminder");
      return res.json() as Promise<{ active: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-reminders"] });
    },
  });

  const isReminderActive = (scheduleId: string) =>
    data?.scheduleIds?.includes(scheduleId) ?? false;

  return {
    reminderIds: data?.scheduleIds ?? [],
    isLoading,
    isReminderActive,
    toggleReminder,
  };
}
