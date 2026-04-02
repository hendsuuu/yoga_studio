"use client";

import { useState, useRef } from "react";
import {
  Camera,
  RefreshCw,
  Activity,
  Target,
  Shield,
  Sparkles,
  Timer,
  ClipboardCheck,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { cleanAIText } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TabGuide() {
  const [subTab, setSubTab] = useState<"scan" | "sequence">("scan");

  return (
    <div className="space-y-5">
      <div className="bg-gray-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-gray-200/50">
        <button
          onClick={() => setSubTab("scan")}
          className={cn(
            "py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase",
            subTab === "scan"
              ? "bg-white shadow-sm text-primary"
              : "text-gray-400",
          )}>
          Body Scan
        </button>
        <button
          onClick={() => setSubTab("sequence")}
          className={cn(
            "py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase",
            subTab === "sequence"
              ? "bg-white shadow-sm text-primary"
              : "text-gray-400",
          )}>
          Sequence Builder
        </button>
      </div>

      {subTab === "scan" ? <PoseScan /> : <SequenceBuilder />}
    </div>
  );
}

function PoseScan() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/pose-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: image.split(",")[1] }),
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

  return (
    <>
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-serif italic mb-1 text-center">
          AI Yoga Guide
        </h3>
        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-6 text-center opacity-80">
          Analisis Postur & Alignment
        </p>

        {!image ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full py-14 border-2 border-dashed border-emerald-800/50 rounded-3xl flex flex-col items-center justify-center gap-3 bg-emerald-900/20 cursor-pointer hover:bg-emerald-900/30 transition-all active:scale-[0.98]">
            <Camera className="w-7 h-7 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Ambil Foto Pose
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={handleUpload}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-black border-2 border-emerald-900">
              <img
                src={image}
                className="w-full h-full object-contain"
                alt="Pose"
              />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                  <span className="text-[10px] font-bold uppercase text-white tracking-widest animate-pulse">
                    Scanning...
                  </span>
                </div>
              )}
            </div>
            {!loading && !result && (
              <div className="flex gap-3">
                <button
                  onClick={() => setImage(null)}
                  className="flex-1 py-3.5 bg-emerald-900/30 text-white rounded-xl font-bold text-[10px] uppercase">
                  Ganti
                </button>
                <button
                  onClick={analyze}
                  className="flex-[2] py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" /> Analisis
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {result && !loading && (
        <div className="animate-in fade-in space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  Analisis Coach AI
                </h4>
                <p className="text-lg font-serif italic text-stone-800">
                  Evaluasi Postur
                </p>
              </div>
            </div>
            <div className="text-[13px] leading-[1.7] text-stone-600 font-medium whitespace-pre-wrap border-l-2 border-emerald-100 pl-4 mb-5">
              {cleanAIText(result)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50/50 p-3 rounded-xl flex flex-col items-center text-center">
                <Activity className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[8px] font-bold text-emerald-700 uppercase">
                  Alignment
                </span>
                <span className="text-[10px] font-semibold text-stone-700">
                  Checked
                </span>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl flex flex-col items-center text-center">
                <Shield className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[8px] font-bold text-emerald-700 uppercase">
                  Safety
                </span>
                <span className="text-[10px] font-semibold text-stone-700">
                  Verified
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setImage(null);
              setResult(null);
            }}
            className="w-full py-3.5 text-[10px] font-bold text-emerald-500 uppercase border-2 border-emerald-100 rounded-xl active:bg-emerald-50">
            Scan Pose Lain
          </button>
        </div>
      )}
    </>
  );
}

function SequenceBuilder() {
  const [duration, setDuration] = useState("15");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!focus) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration, focus }),
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
    toast.success("Sequence disalin");
  }

  return (
    <div className="space-y-5">
      <div className="bg-secondary text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-serif italic mb-1 text-center">
          Sequence Builder
        </h3>
        <p className="text-[9px] text-accent font-bold uppercase tracking-widest mb-6 text-center opacity-80">
          Jadwal Latihan Mandiri
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-accent tracking-widest">
                Durasi
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs outline-none focus:border-accent appearance-none">
                <option value="10">10 Menit</option>
                <option value="15">15 Menit</option>
                <option value="30">30 Menit</option>
                <option value="45">45 Menit</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-accent tracking-widest">
                Intensitas
              </label>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-semibold text-center opacity-50">
                Moderat
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-accent tracking-widest">
              Fokus/Target
            </label>
            <input
              type="text"
              placeholder="Cth: Lower back pain, flexibility..."
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs outline-none focus:border-accent placeholder:text-white/20"
            />
          </div>
          <button
            onClick={generate}
            disabled={!focus || loading}
            className="w-full py-4 bg-gradient-to-r from-accent to-[#E29578] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            SUSUN JADWAL
          </button>
        </div>
      </div>

      {loading && <Loader message="Merangkai aliran gerakan..." />}

      {result && !loading && (
        <div className="animate-in fade-in bg-white rounded-3xl border border-rose-light shadow-lg overflow-hidden">
          <div className="bg-rose-soft p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase">
                  Flow Dibuat
                </span>
                <span className="text-xs font-semibold text-stone-500 block">
                  {duration} Menit
                </span>
              </div>
            </div>
            <button
              onClick={copyResult}
              className="p-2.5 bg-white rounded-xl text-primary shadow-sm active:scale-90">
              <ClipboardCheck className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 text-[13px] leading-[1.8] text-stone-600 font-medium whitespace-pre-wrap">
            {cleanAIText(result)}
          </div>
          <button
            onClick={() => {
              setResult(null);
              setFocus("");
            }}
            className="w-full py-5 text-[10px] font-bold uppercase text-stone-300 border-t border-gray-50 active:bg-gray-50">
            Selesai Latihan
          </button>
        </div>
      )}
    </div>
  );
}
