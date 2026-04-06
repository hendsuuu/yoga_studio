"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  ChevronUp,
  ChevronDown,
  Music,
  Shuffle,
  Repeat,
  Repeat1,
  ListOrdered,
} from "lucide-react";
import { useState } from "react";
import { useAudioPlayer } from "@/providers/audio-player-provider";
import type { PlayMode } from "@/providers/audio-player-provider";

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const modeIcons: Record<PlayMode, { Icon: React.ElementType; label: string }> =
  {
    sequential: { Icon: ListOrdered, label: "Urut" },
    shuffle: { Icon: Shuffle, label: "Acak" },
    "loop-one": { Icon: Repeat1, label: "Ulang 1" },
  };

export function FloatingPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    playMode,
    pause,
    resume,
    next,
    previous,
    seek,
    stop,
    cyclePlayMode,
  } = useAudioPlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const { Icon: ModeIcon, label: modeLabel } = modeIcons[playMode];

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top duration-300">
      {/* Progress bar thin line */}
      {/* <div className="h-0.5 bg-gray-200 w-full">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div> */}

      {/* Mini player */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          {/* Track icon */}
          <div className="w-10 h-10 rounded-xl bg-rose-bg flex items-center justify-center text-primary shrink-0">
            <Music className="w-5 h-5" />
          </div>

          {/* Track info + time */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-secondary truncate">
              {currentTrack.title}
            </p>
            <p className="text-[10px] text-gray-400 font-medium truncate">
              {currentTrack.artist} &middot; {formatTime(progress)} /{" "}
              {formatTime(duration)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={cyclePlayMode}
              title={modeLabel}
              className={`p-2 rounded-lg transition-all ${
                playMode !== "sequential"
                  ? "text-primary bg-rose-bg"
                  : "text-gray-400 hover:text-primary hover:bg-rose-bg"
              }`}>
              <ModeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={previous}
              className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-rose-bg transition-all">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={isPlaying ? pause : resume}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={next}
              className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-rose-bg transition-all">
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all ml-1">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={stop}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded: seek bar */}
        {expanded && (
          <div className="max-w-6xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium text-gray-400 w-10 text-right">
                {formatTime(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
              <span className="text-[10px] font-medium text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
