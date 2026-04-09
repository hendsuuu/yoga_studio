"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, Calendar as CalendarIcon } from "lucide-react";

import { useMemberSession } from "@/hooks/use-member-session";
import { useSchedules } from "@/hooks/use-schedules";
import { useRecordings } from "@/hooks/use-recordings";
import { useAnnouncements } from "@/hooks/use-announcements";

import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { MemberHeader } from "@/components/member/header";
import { NavBar, type TabKey } from "@/components/member/nav-bar";
import { ScheduleCard } from "@/components/member/schedule-card";
import { RecordingCard } from "@/components/member/recording-card";
import { AnnouncementBar } from "@/components/member/announcement-bar";
import { TabMeditation } from "@/components/member/tab-meditation";
import { TabLibrary } from "@/components/member/tab-library";
import { TabGuide } from "@/components/member/tab-guide";
import { TabRelax } from "@/components/member/tab-relax";
import { FloatingPlayer } from "@/components/member/floating-player";

import { formatHumanDate, daysUntil } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("schedule");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: member, isLoading: memberLoading } = useMemberSession();
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();
  const { data: recordings, isLoading: recordingsLoading } = useRecordings();
  const { data: announcements } = useAnnouncements();

  useEffect(() => {
    if (member && !member.isActive) {
      router.replace("/profile");
    }
  }, [member, router]);

  if (memberLoading)
    return <Loader fullScreen message="Menyiapkan Ruang Tenang..." />;
  if (!member || !member.isActive)
    return <Loader fullScreen message="Mengarahkan..." />;

  const filteredRecordings = (recordings || []).filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <MemberHeader member={member} />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 space-y-4 overflow-y-auto no-scrollbar">
        {/* Membership info */}
        {member.membershipExpiresAt && (
          <div className="flex gap-2">
            <div className="flex-1 bg-rose-bg rounded-xl p-3 border border-white flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase opacity-60">
                  Masa Aktif
                </span>
                <p className="text-xs font-bold text-secondary">
                  {formatHumanDate(member.membershipExpiresAt)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center px-4">
              <p className="text-xs font-bold text-primary whitespace-nowrap">
                {daysUntil(member.membershipExpiresAt)} HARI
              </p>
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements?.map((a) => (
          <AnnouncementBar key={a.id} message={a.message} />
        ))}

        {/* Tab Content */}
        <div className="space-y-4 animate-in">
          {activeTab === "schedule" && (
            <>
              {schedulesLoading ? (
                <Loader message="Memuat jadwal..." />
              ) : (schedules || []).length === 0 ? (
                <EmptyState
                  icon={<CalendarIcon className="w-10 h-10" />}
                  title="Belum ada jadwal"
                  description="Jadwal kelas akan muncul di sini"
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {schedules!.map((s) => (
                    <ScheduleCard key={s.id} schedule={s} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "recordings" && (
            <div className="space-y-4">
              <div className="relative max-w-6xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input
                  type="text"
                  placeholder="Cari rekaman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              {recordingsLoading ? (
                <Loader message="Memuat rekaman..." />
              ) : filteredRecordings.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-12 h-12" />}
                  title="Tidak ada rekaman"
                  description={
                    searchQuery
                      ? "Coba kata kunci lain"
                      : "Rekaman akan muncul di sini"
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRecordings.map((r) => (
                    <RecordingCard key={r.id} recording={r} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "meditation" && <TabMeditation />}
          {activeTab === "relax" && <TabRelax />}
          {activeTab === "library" && <TabLibrary />}
          {activeTab === "guide" && <TabGuide />}
        </div>
      </main>

      <FloatingPlayer />
      <NavBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
