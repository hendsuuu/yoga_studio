"use client";

import { useState } from "react";
import { Wind, RefreshCw, Heart, ClipboardCheck, Quote } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { cleanAIText } from "@/lib/utils";
import { toast } from "sonner";

export function TabMeditation() {
  const [mood, setMood] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!mood) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
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
    toast.success("Teks disalin");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="bg-secondary text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h3 className="text-xl sm:text-2xl font-serif italic mb-1">
          Zen Mind AI
        </h3>
        <p className="text-xs text-accent font-bold uppercase tracking-widest mb-5 opacity-80">
          Afirmasi & Meditasi Personal
        </p>
        <textarea
          placeholder="Apa yang Anda rasakan?..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-sm outline-none focus:border-accent placeholder:text-white/30 min-h-[120px] mb-4 transition-all resize-none"
        />
        <button
          onClick={generate}
          disabled={!mood || loading}
          className="w-full py-3.5 bg-accent text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50 transition-all">
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wind className="w-4 h-4" />
          )}
          MULAI AFIRMASI
        </button>
      </div>

      {loading && <Loader message="Menyusun naskah ketenangan..." />}

      {result && !loading && (
        <div className="bg-rose-soft rounded-2xl border border-rose-light shadow-lg overflow-hidden animate-in fade-in">
          <div className="bg-white px-6 py-4 border-b border-rose-bg flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Heart className="w-4 h-4 fill-current" /> Meditation Guide
            </div>
            <button
              onClick={copyResult}
              className="p-2 bg-gray-50 rounded-lg text-primary hover:bg-rose-bg active:scale-90 transition-all">
              <ClipboardCheck className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 sm:p-8 relative">
            <Quote className="absolute top-4 left-4 w-10 h-10 text-rose-light opacity-40" />
            <div className="relative z-10 text-sm sm:text-base leading-relaxed font-serif italic text-stone-700 whitespace-pre-wrap">
              {cleanAIText(result)}
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="w-full py-4 bg-white text-stone-400 font-bold text-xs uppercase tracking-widest border-t border-rose-bg hover:bg-gray-50 transition-colors">
            Selesai Sesi
          </button>
        </div>
      )}
    </div>
  );
}
