"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FAF7F5] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#6D4C41]">
              Terjadi Kesalahan
            </h1>
            <p className="text-[#6D4C41]/70">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah
              diberitahu dan sedang memperbaikinya.
            </p>
            {error.digest && (
              <p className="text-xs text-[#6D4C41]/40 mt-2">
                Kode Error: {error.digest}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C08497] text-white rounded-xl font-medium hover:bg-[#C08497]/90 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Coba Lagi
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#C08497] text-[#C08497] rounded-xl font-medium hover:bg-[#C08497]/5 transition-colors">
              <Home className="w-4 h-4" />
              Ke Beranda
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
