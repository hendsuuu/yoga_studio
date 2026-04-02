"use client";

import { useState } from "react";
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
import { WhatsAppButton } from "@/components/member/whatsapp-button";
import { TabMeditation } from "@/components/member/tab-meditation";
import { TabLibrary } from "@/components/member/tab-library";
import { TabGuide } from "@/components/member/tab-guide";

import { formatHumanDate, daysUntil } from "@/lib/utils";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("schedule");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: member, isLoading: memberLoading } = useMemberSession();
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();
  const { data: recordings, isLoading: recordingsLoading } = useRecordings();
  const { data: announcements } = useAnnouncements();

  const waPhone = process.env.NEXT_PUBLIC_WA_ADMIN || "6281234567890";

  if (memberLoading)
    return <Loader fullScreen message="Menyiapkan Ruang Tenang..." />;
  if (!member) return <Loader fullScreen message="Mengarahkan..." />;

  const filteredRecordings = (recordings || []).filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-6xl mx-auto relative">
      <MemberHeader member={member} />

      <main className="flex-1 px-4 sm:px-6 pt-5 pb-28 space-y-5 overflow-y-auto no-scrollbar">
        {/* Membership info */}
        {member.membershipExpiresAt && (
          <div className="flex gap-2">
            <div className="flex-1 bg-rose-bg rounded-2xl p-3 border border-white flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[7px] font-bold text-primary uppercase opacity-60">
                  Masa Aktif
                </span>
                <p className="text-[10px] font-bold text-secondary truncate">
                  {formatHumanDate(member.membershipExpiresAt)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center px-4">
              <p className="text-[10px] font-bold text-primary whitespace-nowrap">
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
                schedules!.map((s) => <ScheduleCard key={s.id} schedule={s} />)
              )}
            </>
          )}

          {activeTab === "recordings" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="Cari rekaman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-[10px] font-semibold outline-none focus:border-primary/30"
                />
              </div>
              {recordingsLoading ? (
                <Loader message="Memuat rekaman..." />
              ) : filteredRecordings.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-10 h-10" />}
                  title="Tidak ada rekaman"
                  description={
                    searchQuery
                      ? "Coba kata kunci lain"
                      : "Rekaman akan muncul di sini"
                  }
                />
              ) : (
                filteredRecordings.map((r) => (
                  <RecordingCard key={r.id} recording={r} />
                ))
              )}
            </div>
          )}

          {activeTab === "meditation" && <TabMeditation />}
          {activeTab === "library" && <TabLibrary />}
          {activeTab === "guide" && <TabGuide />}
        </div>
      </main>

      <NavBar active={activeTab} onChange={setActiveTab} />
      <WhatsAppButton phone={waPhone} />
    </div>
  );
}
