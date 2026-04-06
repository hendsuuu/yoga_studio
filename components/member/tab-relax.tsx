"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Music,
  Headphones,
  Shuffle,
  ListOrdered,
  Repeat1,
} from "lucide-react";
import { useAudioPlayer } from "@/providers/audio-player-provider";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import type { MusicTrack } from "@/types";

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const categories = [
  { key: "all", label: "Semua" },
  { key: "relaxation", label: "Relaksasi" },
  { key: "meditation", label: "Meditasi" },
  { key: "nature", label: "Alam" },
  { key: "ambient", label: "Ambient" },
];

export function TabRelax() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    playMode,
    play,
    pause,
    resume,
    setTracks,
    cyclePlayMode,
  } = useAudioPlayer();
  const [tracks, setLocalTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((data: MusicTrack[]) => {
        setLocalTracks(data);
        setTracks(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setTracks]);

  const filtered =
    category === "all" ? tracks : tracks.filter((t) => t.category === category);

  function handlePlay(track: MusicTrack) {
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else if (currentTrack?.id === track.id) {
      resume();
    } else {
      play(track);
    }
  }

  if (loading) return <Loader message="Memuat musik..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Category filter + play mode */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === c.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={cyclePlayMode}
          className={`shrink-0 p-2 rounded-xl transition-all ${
            playMode !== "sequential"
              ? "bg-primary/10 text-primary"
              : "bg-gray-100 text-gray-400 hover:text-primary"
          }`}
          title={
            playMode === "sequential"
              ? "Urut"
              : playMode === "shuffle"
                ? "Acak"
                : "Ulang 1"
          }>
          {playMode === "shuffle" ? (
            <Shuffle className="w-4 h-4" />
          ) : playMode === "loop-one" ? (
            <Repeat1 className="w-4 h-4" />
          ) : (
            <ListOrdered className="w-4 h-4" />
          )}
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Music className="w-10 h-10" />}
          title="Tidak ada musik"
          description="Musik akan ditambahkan segera"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;

            return (
              <button
                key={track.id}
                onClick={() => handlePlay(track)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  isCurrent
                    ? "bg-rose-bg border-primary/20 shadow-sm"
                    : "bg-white border-gray-100 hover:border-primary/10 hover:shadow-sm"
                }`}>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-400"
                  }`}>
                  {isCurrentPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? "text-primary" : "text-secondary"
                    }`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {track.artist} &middot;{" "}
                    {isCurrent && isPlaying
                      ? `${formatTime(progress)} / ${formatTime(duration)}`
                      : track.duration}
                  </p>
                </div>
                <div className="shrink-0">
                  <Headphones
                    className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-gray-300"}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
