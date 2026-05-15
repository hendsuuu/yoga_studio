"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  enabledText?: string;
  disabledText?: string;
  description?: string;
};

export function StatusSwitch({
  checked,
  onChange,
  label = "Status",
  enabledText = "Aktif",
  disabledText = "Nonaktif",
  description,
}: StatusSwitchProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              checked ? "text-emerald-700" : "text-gray-500",
            )}>
            {checked ? enabledText : disabledText}
          </p>
          {description && (
            <p className="mt-1 text-xs leading-5 text-gray-400">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative h-8 w-16 shrink-0 rounded-full p-1 transition-all",
            checked
              ? "bg-emerald-500 shadow-sm shadow-emerald-500/20"
              : "bg-gray-200",
          )}>
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-transform",
              checked && "translate-x-8 text-emerald-600",
            )}>
            {checked ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          </span>
        </button>
      </div>
    </div>
  );
}
