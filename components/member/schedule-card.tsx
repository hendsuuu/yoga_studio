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
    <div className="rounded-2xl p-5 sm:p-6 border bg-white border-gray-100 shadow-sm relative overflow-hidden">
      {isLive && (
        <div className="absolute -top-0.5 left-5 bg-red-500 text-white px-3 py-1 rounded-b-xl text-[9px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-pulse z-10">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          LIVE
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">
            {formatScheduleDate(schedule.date)}
          </span>
          <h4 className="text-lg sm:text-xl font-serif italic text-secondary leading-tight mt-0.5">
            {schedule.title}
          </h4>
        </div>
        <div className="bg-rose-bg px-3 py-1.5 rounded-full text-xs font-bold text-primary shrink-0">
          {schedule.timeRange}
        </div>
      </div>

      {/* Coach info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={
            schedule.coachPhoto ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(schedule.coach)}&background=C08497&color=fff`
          }
          alt={schedule.coach}
          className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
        />
        <div>
          <span className="text-sm font-semibold text-gray-700">
            {schedule.coach}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            {schedule.certificate || "Instructor"}
          </span>
        </div>
      </div>

      {/* Tools */}
      {schedule.tools && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {schedule.tools.split(",").map((tool, i) => (
            <div
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-bold uppercase border border-primary/10">
              <CheckCircle2 className="w-3 h-3" /> {tool.trim()}
            </div>
          ))}
        </div>
      )}

      {/* Meeting ID & Pass */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100">
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              ID
            </span>
            <span className="text-xs font-bold text-secondary block truncate">
              {schedule.meetingId || "—"}
            </span>
          </div>
          <button
            onClick={() => copy(schedule.meetingId || "", "ID")}
            className="p-1.5 bg-white rounded-lg shadow-sm text-primary hover:bg-rose-bg transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100">
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              PASS
            </span>
            <span className="text-xs font-bold text-secondary block truncate">
              {schedule.meetingPass || "—"}
            </span>
          </div>
          <button
            onClick={() => copy(schedule.meetingPass || "", "Pass")}
            className="p-1.5 bg-white rounded-lg shadow-sm text-primary hover:bg-rose-bg transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Join button */}
      <a
        href={schedule.zoomUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-secondary text-white text-xs font-bold uppercase tracking-widest hover:bg-secondary/90 active:scale-[0.98] transition-all">
        <Video className="w-4 h-4" /> MASUK STUDIO
      </a>
    </div>
  );
}
