"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, LogIn } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800">Terjadi Kesalahan</h2>
          <p className="text-gray-500 text-sm">
            Halaman admin mengalami masalah. Silakan coba lagi.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-1">Kode: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <LogIn className="w-4 h-4" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
