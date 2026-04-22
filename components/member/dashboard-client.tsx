"use client";

import {
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Clock, Search } from "lucide-react";

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
import type { Announcement, MemberSession, Recording, Schedule } from "@/types";

type DashboardClientProps = {
  activeTab: TabKey;
  announcements: Announcement[];
  initialRecordingDate: string;
  initialSearchQuery: string;
  member: MemberSession;
  recordings: Recording[];
  schedules: Schedule[];
};

const PREMIUM_DEFAULT_TAB: TabKey = "schedule";
const FREE_DEFAULT_TAB: TabKey = "relax";

export function DashboardClient({
  activeTab,
  announcements,
  initialRecordingDate,
  initialSearchQuery,
  member,
  recordings,
  schedules,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [recordingDate, setRecordingDate] = useState(initialRecordingDate);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const isFree = member.tier === "FREE";
  const defaultTab = isFree ? FREE_DEFAULT_TAB : PREMIUM_DEFAULT_TAB;

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    setRecordingDate(initialRecordingDate);
  }, [initialRecordingDate]);

  useEffect(() => {
    if (activeTab !== "recordings") {
      return;
    }

    const nextQuery = deferredSearchQuery.trim();
    const currentQuery = searchParams.get("q") ?? "";

    if (nextQuery === currentQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [activeTab, deferredSearchQuery, pathname, router, searchParams]);

  function replaceParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  function handleTabChange(tab: TabKey) {
    replaceParams((params) => {
      if (tab === defaultTab) {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
    });
  }

  function handleRecordingDateChange(nextDate: string) {
    setRecordingDate(nextDate);
    replaceParams((params) => {
      if (nextDate) {
        params.set("date", nextDate);
      } else {
        params.delete("date");
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <MemberHeader member={member} />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 space-y-4 overflow-y-auto no-scrollbar">
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

        {announcements.map((announcement) => (
          <AnnouncementBar key={announcement.id} message={announcement.message} />
        ))}

        <div className="space-y-4 animate-in">
          {activeTab === "schedule" &&
            ((schedules || []).length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="w-10 h-10" />}
                title="Belum ada jadwal"
                description="Jadwal kelas akan muncul di sini"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {schedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            ))}

          {activeTab === "recordings" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative max-w-6xl mx-auto w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Cari rekaman..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="relative max-w-6xl mx-auto w-full">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                  <input
                    type="date"
                    value={recordingDate}
                    onChange={(event) =>
                      handleRecordingDateChange(event.target.value)
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {(recordingDate || initialSearchQuery) && (
                <div className="flex items-center justify-between gap-3 text-[11px] text-gray-400">
                  <span>
                    {recordingDate
                      ? `Filter tanggal aktif: ${formatHumanDate(recordingDate)}`
                      : "Menampilkan hasil pencarian rekaman"}
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setRecordingDate("");
                      replaceParams((params) => {
                        params.delete("q");
                        params.delete("date");
                      });
                    }}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Reset filter
                  </button>
                </div>
              )}

              {isPending && <Loader message="Memuat rekaman..." />}

              {!isPending && recordings.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-12 h-12" />}
                  title="Tidak ada rekaman"
                  description={
                    recordingDate || initialSearchQuery
                      ? "Coba ubah kata kunci atau tanggal filter"
                      : "Rekaman akan muncul di sini"
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recordings.map((recording) => (
                    <RecordingCard key={recording.id} recording={recording} />
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
      <NavBar active={activeTab} onChange={handleTabChange} isFree={isFree} />
    </div>
  );
}
