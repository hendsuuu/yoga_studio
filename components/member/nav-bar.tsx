"use client";

import { Calendar, Video, Wind, BookOpen, Scan, Music } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey =
  | "schedule"
  | "recordings"
  | "meditation"
  | "relax"
  | "library"
  | "guide";

const tabs: { key: TabKey; icon: React.ElementType; label: string }[] = [
  { key: "schedule", icon: Calendar, label: "Live" },
  { key: "recordings", icon: Video, label: "Replay" },
  { key: "relax", icon: Music, label: "Music" },
  { key: "meditation", icon: Wind, label: "Mind" },
  { key: "library", icon: BookOpen, label: "Library" },
  { key: "guide", icon: Scan, label: "Guide" },
];

interface NavBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function NavBar({ active, onChange }: NavBarProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
      <nav className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-gray-200/60 px-2 sm:px-4 py-2.5 sm:py-3 flex justify-around items-center shadow-xl ring-1 ring-black/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all",
              active === tab.key
                ? "text-primary bg-primary/5"
                : "text-gray-400 hover:text-gray-500",
            )}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
