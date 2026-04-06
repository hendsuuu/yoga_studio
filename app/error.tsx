"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-in">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-secondary">
            Oops! Ada yang tidak beres
          </h1>
          <p className="text-secondary/70">
            Halaman ini mengalami masalah. Silakan coba lagi atau kembali ke
            beranda.
          </p>
          {error.digest && (
            <p className="text-xs text-secondary/40 mt-2">
              Kode: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors">
            <Home className="w-4 h-4" />
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
