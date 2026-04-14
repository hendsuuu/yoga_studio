"use client";

import { Video, Copy, CheckCircle2 } from "lucide-react";
import type { Schedule } from "@/types";
import { useCopy } from "@/hooks/use-copy";
import { formatScheduleDate, checkIfLive } from "@/lib/utils";

interface Props {
  schedule: Schedule;
}

export function ScheduleCard({ schedule }: Props) {
  const { copy } = useCopy();
  const isLive = checkIfLive(schedule.date, schedule.timeRange);

  return (
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
  );
}
