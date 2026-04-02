"use client";

import { Calendar, Video, Wind, BookOpen, Scan } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey =
  | "schedule"
  | "recordings"
  | "meditation"
  | "library"
  | "guide";

const tabs: { key: TabKey; icon: React.ElementType; label: string }[] = [
  { key: "schedule", icon: Calendar, label: "Live" },
  { key: "recordings", icon: Video, label: "Replay" },
  { key: "meditation", icon: Wind, label: "Mind" },
  { key: "library", icon: BookOpen, label: "Book" },
  { key: "guide", icon: Scan, label: "Guide" },
];

interface NavBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function NavBar({ active, onChange }: NavBarProps) {
  return (
    <div className="absolute bottom-5 left-4 right-4 z-50">
      <nav className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 px-2 py-3 flex justify-around items-center shadow-lg ring-1 ring-black/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all",
              active === tab.key ? "text-primary" : "text-gray-300",
            )}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[7px] font-bold uppercase tracking-tight">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export function TabBar({ active, onChange }: NavBarProps) {
  return (
    <div className="bg-gray-100 p-1.5 rounded-2xl grid grid-cols-5 gap-1 border border-gray-200/50">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "py-2.5 rounded-xl transition-all text-[10px] font-bold uppercase tracking-tight",
            active === tab.key
              ? "bg-white shadow-sm text-primary"
              : "text-gray-400",
          )}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
