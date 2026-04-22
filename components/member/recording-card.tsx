"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { PlayCircle, X } from "lucide-react";
import type { Recording } from "@/types";
import { formatScheduleDate } from "@/lib/utils";

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0];
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1].split("?")[0];
      }
      return parsed.searchParams.get("v");
    }
  } catch {
    // invalid URL
  }
  return null;
}

interface Props {
  recording: Recording;
}

export function RecordingCard({ recording }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const videoId = getYouTubeVideoId(recording.url);

  function handleOpen() {
    setIframeSrc(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
    setIsOpen(true);
  }

  function handleClose() {
    setIframeSrc("");
    setIsOpen(false);
  }

  return (
    <>
      <div
        className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => videoId && handleOpen()}>
        <div className="w-10 h-10 rounded-lg bg-rose-bg flex items-center justify-center text-primary shrink-0">
          <PlayCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-primary uppercase">
            {formatScheduleDate(recording.date)}
          </p>
          <h4 className="text-xs font-semibold text-secondary truncate leading-tight">
            {recording.title}
          </h4>
          <p className="text-[11px] text-gray-400 font-medium">
            {recording.coach} • {recording.duration || "—"}
          </p>
        </div>
        {videoId ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="p-2 bg-gray-50 rounded-lg text-primary hover:bg-rose-bg transition-colors shrink-0">
            <PlayCircle className="w-3.5 h-3.5" />
          </button>
        ) : (
          <a
            href={recording.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-gray-50 rounded-lg text-primary hover:bg-rose-bg transition-colors shrink-0">
            <PlayCircle className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {isOpen &&
        videoId &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center p-4"
            onClick={handleClose}>
            <div
              className="w-full max-w-2xl bg-secondary rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-[9px] font-bold text-primary uppercase">
                    {formatScheduleDate(recording.date)}
                  </p>
                  <h4 className="text-sm font-semibold text-white truncate leading-tight">
                    {recording.title}
                  </h4>
                  <p className="text-[11px] text-white/60 font-medium">
                    {recording.coach} • {recording.duration || "—"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={iframeSrc}
                  title={recording.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
