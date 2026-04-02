"use client";

import { PlayCircle, ChevronRight } from "lucide-react";
import type { Recording } from "@/types";
import { formatScheduleDate } from "@/lib/utils";

interface Props {
  recording: Recording;
}

export function RecordingCard({ recording }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-rose-bg flex items-center justify-center text-primary shrink-0">
        <PlayCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-bold text-primary uppercase">
          {formatScheduleDate(recording.date)}
        </p>
        <h4 className="text-xs font-semibold text-secondary truncate leading-tight">
          {recording.title}
        </h4>
        <p className="text-[8px] text-gray-400 font-medium">
          {recording.coach} • {recording.duration || "—"}
        </p>
      </div>
      <a
        href={recording.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 rounded-lg text-primary active:bg-rose-bg">
        <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
}
