"use client";

import { useState } from "react";
import {
  Search,
  Library,
  RefreshCw,
  Sparkles,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { cleanAIText } from "@/lib/utils";
import { toast } from "sonner";

export function TabLibrary() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.text);
    } catch {
      toast.error("AI sedang sibuk, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(cleanAIText(result));
    toast.success("Materi disalin");
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 text-white p-6 rounded-3xl shadow-lg text-center">
        <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/20">
          <BookOpen className="w-5 h-5 text-emerald-300" />
        </div>
        <h3 className="text-xl font-serif italic mb-1">Yoga Library AI</h3>
        <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest mb-5 opacity-80">
          Pustakawan Ilmu Yoga
        </p>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Tanya tentang yoga..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs outline-none focus:border-emerald-400 placeholder:text-white/20 text-left"
          />
        </div>
        <button
          onClick={generate}
          disabled={!query || loading}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Library className="w-4 h-4" />
          )}
          TANYA PUSTAKAWAN
        </button>
      </div>

      {loading && <Loader message="Mencari lembar ilmu..." />}

      {result && !loading && (
        <div className="bg-white rounded-3xl border-l-[6px] border-l-emerald-600 border border-emerald-50 shadow-lg overflow-hidden animate-in fade-in">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Wawasan Yoga
              </span>
            </div>
            <div className="text-[13px] leading-[1.7] text-stone-600 font-medium whitespace-pre-wrap">
              {cleanAIText(result)}
            </div>
          </div>
          <div className="flex p-2 gap-2 bg-emerald-50/30 border-t border-emerald-50">
            <button
              onClick={copyResult}
              className="flex-1 py-3.5 bg-white text-emerald-700 rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-sm active:scale-[0.98]">
              <ClipboardCheck className="w-3.5 h-3.5 inline mr-1.5" />
              Salin
            </button>
            <button
              onClick={() => {
                setResult(null);
                setQuery("");
              }}
              className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-lg active:scale-[0.98]">
              Tanya Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
