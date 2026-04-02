import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loader({ message = "Memuat...", fullScreen }: LoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        fullScreen ? "h-screen bg-surface" : "py-16",
      )}>
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-rose-light rounded-full animate-ping opacity-30" />
        <div className="relative bg-white p-5 rounded-full shadow-lg border-2 border-white">
          <Flower2
            className="w-8 h-8 text-primary animate-spin"
            style={{ animationDuration: "4s" }}
          />
        </div>
      </div>
      <p className="text-sm font-serif italic text-secondary">{message}</p>
      <div className="flex justify-center gap-1.5 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
