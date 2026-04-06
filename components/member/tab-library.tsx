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
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="bg-gradient-to-br from-secondary to-secondary/80 text-white p-6 sm:p-8 rounded-2xl shadow-lg text-center">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/20">
          <BookOpen className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-xl sm:text-2xl font-serif italic mb-1">
          Yoga Library AI
        </h3>
        <p className="text-xs text-accent font-bold uppercase tracking-widest mb-5 opacity-80">
          Pustakawan Ilmu Yoga
        </p>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Tanya tentang yoga..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-accent placeholder:text-white/30 text-left transition-all"
          />
        </div>
        <button
          onClick={generate}
          disabled={!query || loading}
          className="w-full py-3.5 bg-accent text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50 transition-all">
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
        <div className="bg-white rounded-2xl border-l-4 border-l-primary border border-gray-100 shadow-lg overflow-hidden animate-in fade-in">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Wawasan Yoga
              </span>
            </div>
            <div className="text-sm leading-relaxed text-stone-600 font-medium whitespace-pre-wrap">
              {cleanAIText(result)}
            </div>
          </div>
          <div className="flex p-3 gap-2 bg-gray-50/50 border-t border-gray-100">
            <button
              onClick={copyResult}
              className="flex-1 py-3 bg-white text-primary rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-rose-bg active:scale-[0.98] transition-all">
              <ClipboardCheck className="w-3.5 h-3.5 inline mr-1.5" />
              Salin
            </button>
            <button
              onClick={() => {
                setResult(null);
                setQuery("");
              }}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all">
              Tanya Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
