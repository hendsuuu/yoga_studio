"use client";

import { useState } from "react";
import {
  Video,
  Copy,
  CheckCircle2,
  Bell,
  BellOff,
  CalendarPlus,
} from "lucide-react";
import type { Schedule } from "@/types";
import { useCopy } from "@/hooks/use-copy";
import { formatScheduleDate, checkIfLive } from "@/lib/utils";
import { generateGoogleCalendarUrl, parseScheduleTimes } from "@/lib/calendar";
import { usePushNotification } from "@/hooks/use-push-notification";
import { useScheduleReminders } from "@/hooks/use-schedule-reminders";
import { NotificationBlockedModal } from "@/components/member/notification-blocked-modal";
import { toast } from "sonner";

interface Props {
  schedule: Schedule;
}

export function ScheduleCard({ schedule }: Props) {
  const { copy } = useCopy();
  const isLive = checkIfLive(schedule.date, schedule.timeRange);
  const { permission, isSubscribed, subscribe, refreshPermission } =
    usePushNotification();
  const { isReminderActive, toggleReminder } = useScheduleReminders();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const reminderActive = isReminderActive(schedule.id);

  const handleReminder = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser tidak mendukung notifikasi.");
      return;
    }

    if (permission === "denied" || Notification.permission === "denied") {
      setShowBlockedModal(true);
      return;
    }

    if (permission === "unsupported") {
      toast.error("Browser tidak mendukung notifikasi push.");
      return;
    }

    // Minta izin langsung dari klik user
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      refreshPermission();

      if (result !== "granted") {
        toast.error("Izin notifikasi belum diberikan.");
        return;
      }
    }

    if (!isSubscribed) {
      const ok = await subscribe();
      if (!ok) {
        toast.error("Gagal mengaktifkan notifikasi. Coba lagi.");
        return;
      }
    }

    toggleReminder.mutate(schedule.id, {
      onSuccess: (data) => {
        if (data.active) {
          toast.success(
            "Pengingat aktif! Kamu akan diingatkan 30 menit sebelum kelas.",
          );
        } else {
          toast("Pengingat dinonaktifkan.");
        }
      },
      onError: () => toast.error("Gagal mengatur pengingat."),
    });
  };

  const handleGoogleCalendar = () => {
    const { start, end } = parseScheduleTimes(
      schedule.date,
      schedule.timeRange,
    );
    const url = generateGoogleCalendarUrl({
      title: schedule.title,
      start,
      end,
      coach: schedule.coach,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    setCalendarOpen(false);
  };

  const handleICSDownload = () => {
    // Trigger ICS download via API
    const url = `/api/calendar/ics?scheduleId=${schedule.id}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarOpen(false);
  };

  return (
    <>
      {showBlockedModal && (
        <NotificationBlockedModal onClose={() => setShowBlockedModal(false)} />
      )}
      <div className="rounded-xl p-4 sm:p-5 border bg-white border-gray-100 shadow-sm relative overflow-hidden">
        {isLive && (
          <div className="absolute -top-0.5 left-4 bg-red-500 text-white px-2.5 py-0.5 rounded-b-lg text-[8px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1 animate-pulse z-10">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            LIVE
          </div>
        )}

        <div className="flex justify-between items-start mb-2.5">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">
              {formatScheduleDate(schedule.date)}
            </span>
            <h4 className="text-base sm:text-lg font-serif italic text-secondary leading-tight mt-0.5">
              {schedule.title}
            </h4>
          </div>
          <div className="bg-rose-bg px-2.5 py-1 rounded-full text-[11px] font-bold text-primary shrink-0">
            {schedule.timeRange}
          </div>
        </div>

        {/* Coach info */}
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={
              schedule.coachPhoto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(schedule.coach)}&background=C08497&color=fff`
            }
            alt={schedule.coach}
            className="w-9 h-9 rounded-lg object-cover border-2 border-white shadow-sm"
          />
          <div>
            <span className="text-xs font-semibold text-gray-700">
              {schedule.coach}
            </span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
              {schedule.certificate || "Instructor"}
            </span>
          </div>
        </div>

        {/* Tools */}
        {schedule.tools && (
          <div className="flex flex-wrap gap-1 mb-3">
            {schedule.tools.split(",").map((tool, i) => (
              <div
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 bg-primary/5 text-primary rounded-md text-[9px] font-bold uppercase border border-primary/10"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> {tool.trim()}
              </div>
            ))}
          </div>
        )}

        {/* Meeting ID & Pass */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between border border-gray-100">
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                ID
              </span>
              <span className="text-[11px] font-bold text-secondary block truncate">
                {schedule.meetingId || "—"}
              </span>
            </div>
            <button
              onClick={() => copy(schedule.meetingId || "", "ID")}
              className="p-1 bg-white rounded-md shadow-sm text-primary hover:bg-rose-bg transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between border border-gray-100">
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                PASS
              </span>
              <span className="text-[11px] font-bold text-secondary block truncate">
                {schedule.meetingPass || "—"}
              </span>
            </div>
            <button
              onClick={() => copy(schedule.meetingPass || "", "Pass")}
              className="p-1 bg-white rounded-md shadow-sm text-primary hover:bg-rose-bg transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Reminder & Calendar buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleReminder}
            disabled={toggleReminder.isPending}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] ${
              reminderActive
                ? "bg-primary text-white shadow-sm"
                : "bg-primary/5 text-primary border border-primary/15 hover:bg-primary/10"
            }`}
          >
            {reminderActive ? (
              <>
                <BellOff className="w-3.5 h-3.5" />
                PENGINGAT AKTIF
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                AKTIFKAN PENGINGAT
              </>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-primary/5 text-primary border border-primary/15 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 transition-all active:scale-[0.97]"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              TAMBAH KE KALENDER
            </button>
            {calendarOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setCalendarOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-100 z-30 overflow-hidden">
                  <button
                    onClick={handleICSDownload}
                    className="w-full px-3 py-2.5 text-left text-[11px] font-semibold text-gray-700 hover:bg-rose-bg/50 transition-colors flex items-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4 text-primary" />
                    Simpan ke Kalender HP
                  </button>
                  {/* <button
                    onClick={handleGoogleCalendar}
                    className="w-full px-3 py-2.5 text-left text-[11px] font-semibold text-gray-700 hover:bg-rose-bg/50 transition-colors flex items-center gap-2 border-t border-gray-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 3H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3z"
                        fill="#4285F4"
                      />
                      <path d="M6 3h4v4H6V3z" fill="#EA4335" />
                      <path d="M14 3h4a3 3 0 013 3v1h-7V3z" fill="#FBBC04" />
                      <path
                        d="M3 10h18v8a3 3 0 01-3 3H6a3 3 0 01-3-3v-8z"
                        fill="#34A853"
                      />
                      <rect
                        x="7"
                        y="12"
                        width="10"
                        height="1.5"
                        rx=".75"
                        fill="#fff"
                      />
                      <rect
                        x="7"
                        y="15"
                        width="7"
                        height="1.5"
                        rx=".75"
                        fill="#fff"
                      />
                    </svg>
                    Google Calendar (Web)
                  </button> */}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Join button */}
        <a
          href={schedule.zoomUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-secondary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-secondary/90 active:scale-[0.98] transition-all"
        >
          <Video className="w-3.5 h-3.5" /> MASUK STUDIO
        </a>
      </div>
    </>
  );
}
