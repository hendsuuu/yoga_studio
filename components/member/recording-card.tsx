"use client";

import { PlayCircle, ChevronRight } from "lucide-react";
import type { Recording } from "@/types";
import { formatScheduleDate } from "@/lib/utils";

interface Props {
  recording: Recording;
}

export function RecordingCard({ recording }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-rose-bg flex items-center justify-center text-primary shrink-0">
        <PlayCircle className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-primary uppercase">
          {formatScheduleDate(recording.date)}
        </p>
        <h4 className="text-sm font-semibold text-secondary truncate leading-tight">
          {recording.title}
        </h4>
        <p className="text-xs text-gray-400 font-medium">
          {recording.coach} • {recording.duration || "—"}
        </p>
      </div>
      <a
        href={recording.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 rounded-xl text-primary hover:bg-rose-bg transition-colors">
        <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
}
