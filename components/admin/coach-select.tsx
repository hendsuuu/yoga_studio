"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";
import type { Coach } from "@/types";
import { getAvatarUrl } from "@/lib/avatar";

interface CoachSelectProps {
  value: string;
  onChange: (name: string, coach?: Coach) => void;
  coaches: Coach[];
  placeholder?: string;
  label?: string;
}

export function CoachSelect({
  value,
  onChange,
  coaches,
  placeholder = "Cari dan pilih coach...",
  label,
}: CoachSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = coaches.filter(
    (c) =>
      c.isActive &&
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = useCallback(
    (coach: Coach) => {
      onChange(coach.name, coach);
      setSearch("");
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
    setSearch("");
  }, [onChange]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
          open
            ? "border-primary/40 ring-2 ring-primary/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}>
        <Search className="w-4 h-4 text-gray-300 shrink-0" />
        {open ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 text-sm truncate ${
              value ? "text-secondary font-medium" : "text-gray-300"
            }`}>
            {value || placeholder}
          </span>
        )}
        {value && !open ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-0.5 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              {coaches.length === 0
                ? "Belum ada data coach"
                : "Coach tidak ditemukan"}
            </div>
          ) : (
            filtered.map((coach) => {
              const isSelected = value === coach.name;
              return (
                <button
                  key={coach.id}
                  type="button"
                  onClick={() => handleSelect(coach)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                    isSelected
                      ? "bg-rose-50 text-primary"
                      : "hover:bg-gray-50 text-secondary"
                  }`}>
                  <img
                    src={getAvatarUrl(coach.name, coach.photo, 32)}
                    alt={coach.name}
                    className="w-7 h-7 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{coach.name}</p>
                    {(coach.specialty || coach.certificate) && (
                      <p className="text-[10px] text-gray-400 truncate">
                        {[coach.specialty, coach.certificate]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
