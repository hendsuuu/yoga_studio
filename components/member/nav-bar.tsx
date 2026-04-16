"use client";

import { useState } from "react";
import { Calendar, Video, Wind, BookOpen, Scan, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumPopup } from "./premium-popup";

export type TabKey =
  | "schedule"
  | "recordings"
  | "meditation"
  | "relax"
  | "library"
  | "guide";

const PREMIUM_TABS: TabKey[] = ["schedule", "recordings"];

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
  isFree?: boolean;
}

export function NavBar({ active, onChange, isFree }: NavBarProps) {
  const [showPremium, setShowPremium] = useState(false);

  function handleTabClick(key: TabKey) {
    if (isFree && PREMIUM_TABS.includes(key)) {
      setShowPremium(true);
      return;
    }
    onChange(key);
  }

  return (
    <>
      <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl">
        <nav className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-gray-200/60 px-1.5 sm:px-3 py-2 sm:py-2.5 flex justify-around items-center shadow-xl ring-1 ring-black/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-1 rounded-lg transition-all",
                active === tab.key
                  ? "text-primary bg-primary/5"
                  : "text-gray-400 hover:text-gray-500",
              )}>
              <tab.icon className="w-4 h-4" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
      <PremiumPopup open={showPremium} onClose={() => setShowPremium(false)} />
    </>
  );
}
