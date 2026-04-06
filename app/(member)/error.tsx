"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Member error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="mx-auto w-14 h-14 bg-rose-light rounded-full flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-secondary">
            Oops! Ada Masalah
          </h2>
          <p className="text-secondary/60 text-sm">
            Terjadi kesalahan saat memuat halaman. Coba lagi atau kembali ke
            dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-secondary/30 mt-1">
              Kode: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary/30 text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors">
            <Home className="w-4 h-4" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
