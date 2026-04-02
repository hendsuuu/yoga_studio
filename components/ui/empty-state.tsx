import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-gray-300">{icon}</div>
      <p className="text-sm font-semibold text-gray-400">{title}</p>
      {description && (
        <p className="text-xs text-gray-300 mt-1">{description}</p>
      )}
    </div>
  );
}
