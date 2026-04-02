import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export function StatsCard({
  icon,
  label,
  value,
  color = "text-primary",
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 ${color}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-secondary">{value}</p>
    </div>
  );
}
