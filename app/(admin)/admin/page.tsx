"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, Video, Megaphone, UserCheck } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { Loader } from "@/components/ui/loader";
import type { AdminStats } from "@/types";

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif italic text-secondary">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Overview aplikasi Virtual Studio
        </p>
      </div>

      {isLoading ? (
        <Loader message="Memuat statistik..." />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            icon={<Users className="w-4 h-4" />}
            label="Total Member"
            value={stats.totalMembers}
          />
          <StatsCard
            icon={<UserCheck className="w-4 h-4" />}
            label="Member Aktif"
            value={stats.activeMembers}
            color="text-emerald-600"
          />
          <StatsCard
            icon={<Calendar className="w-4 h-4" />}
            label="Total Schedule"
            value={stats.totalSchedules}
          />
          <StatsCard
            icon={<Video className="w-4 h-4" />}
            label="Total Recording"
            value={stats.totalRecordings}
          />
          <StatsCard
            icon={<Megaphone className="w-4 h-4" />}
            label="Announcement Aktif"
            value={stats.activeAnnouncements}
            color="text-amber-600"
          />
        </div>
      ) : null}
    </div>
  );
}
