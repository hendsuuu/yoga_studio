"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  Video,
  Megaphone,
  UserCheck,
  Dumbbell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatsCard } from "@/components/admin/stats-card";
import { Loader } from "@/components/ui/loader";
import type { AdminStats } from "@/types";

const PIE_COLORS = ["#C08497", "#10b981", "#f59e0b", "#6366f1"];

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const pieData = stats
    ? [
        { name: "Aktif", value: stats.activeMembers },
        {
          name: "Nonaktif",
          value: stats.totalMembers - stats.activeMembers,
        },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif italic text-secondary">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Overview aplikasi Virtual Studio
        </p>
      </div>

      {isLoading ? (
        <Loader message="Memuat statistik..." />
      ) : stats ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
              icon={<Dumbbell className="w-4 h-4" />}
              label="Total Coach"
              value={stats.totalCoaches}
              color="text-indigo-600"
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
              label="Announcement"
              value={stats.activeAnnouncements}
              color="text-amber-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart - Recent Members */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-secondary mb-4">
                Member Baru (30 hari terakhir)
              </h3>
              {stats.recentMembers.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.recentMembers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #f3f4f6",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#C08497"
                      radius={[6, 6, 0, 0]}
                      name="Member"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-300">
                  Belum ada data member baru
                </div>
              )}
            </div>

            {/* Pie Chart - Member Status */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-secondary mb-4">
                Status Member
              </h3>
              {stats.totalMembers > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none">
                      {pieData.map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      iconType="circle"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #f3f4f6",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-300">
                  Belum ada member
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
