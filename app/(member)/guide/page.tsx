"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Maximize,
  Music,
  PlayCircle,
  User,
  Wind,
} from "lucide-react";
import Link from "next/link";

import { MemberHeader } from "@/components/member/header";
import { Loader } from "@/components/ui/loader";
import { useMemberSession } from "@/hooks/use-member-session";
import { daysUntil, formatHumanDate } from "@/lib/utils";

type Feature = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  description: string;
  steps: string[];
};

const features: Feature[] = [
  {
    id: "live",
    title: "Kelas Live",
    icon: <Calendar className="w-5 h-5" />,
    color: "bg-rose-100",
    textColor: "text-rose-700",
    description: "Ikuti sesi latihan real-time bersama instruktur.",
    steps: [
      'Buka tab "LIVE" pada menu bawah.',
      "Pilih jadwal kelas yang tersedia.",
      'Klik "TAMBAH KE KALENDER" agar tidak terlewat.',
      'Klik "MASUK STUDIO" saat jam kelas dimulai menggunakan ID & Pass yang tertera.',
    ],
  },
  {
    id: "replay",
    title: "Replay",
    icon: <PlayCircle className="w-5 h-5" />,
    color: "bg-orange-100",
    textColor: "text-orange-700",
    description: "Akses ribuan rekaman kelas kapan saja.",
    steps: [
      'Buka tab "REPLAY".',
      "Gunakan fitur pencarian untuk mencari nama instruktur atau jenis yoga.",
      "Klik tombol play pada video untuk memulai latihan mandiri.",
    ],
  },
  {
    id: "music",
    title: "Music",
    icon: <Music className="w-5 h-5" />,
    color: "bg-pink-100",
    textColor: "text-pink-700",
    description: "Musik pendamping meditasi dan relaksasi.",
    steps: [
      'Buka tab "MUSIC".',
      "Pilih kategori: Relaksasi, Meditasi, atau Alam.",
      "Klik ikon play pada daftar lagu untuk memutar audio di latar belakang.",
    ],
  },
  {
    id: "mind",
    title: "Zen Mind AI",
    icon: <Wind className="w-5 h-5" />,
    color: "bg-stone-200",
    textColor: "text-stone-800",
    description: "Afirmasi dan meditasi personal berbasis AI.",
    steps: [
      'Buka tab "MIND".',
      "Tuliskan perasaan atau kondisi Anda saat ini di kolom input.",
      'Klik "MULAI AFIRMASI" untuk mendapatkan panduan suara atau teks khusus untuk Anda.',
    ],
  },
  {
    id: "library",
    title: "Yoga Library",
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-stone-200",
    textColor: "text-stone-800",
    description: "Pustakawan digital untuk semua pertanyaan yoga Anda.",
    steps: [
      'Buka tab "LIBRARY".',
      "Ketik pertanyaan apapun tentang teknik atau filosofi yoga.",
      "Dapatkan jawaban mendalam dari AI Pustakawan kami.",
    ],
  },
  {
    id: "ai-guide",
    title: "AI Guide",
    icon: <Maximize className="w-5 h-5" />,
    color: "bg-rose-50",
    textColor: "text-rose-900",
    description: "Analisis postur dan penyusun jadwal otomatis.",
    steps: [
      "BODY SCAN: Ambil foto pose Anda untuk cek alignment tubuh.",
      'SEQUENCE BUILDER: Masukkan durasi dan fokus (misal: "Back Pain").',
      "Dapatkan rangkaian gerakan (sequence) yang disusun khusus untuk Anda.",
    ],
  },
];

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<string>("live");
  const { data: member, isLoading } = useMemberSession();

  if (isLoading) {
    return <Loader fullScreen message="Memuat panduan..." />;
  }

  if (!member) {
    return <Loader fullScreen message="Mengarahkan..." />;
  }

  const remainingDays = member.membershipExpiresAt
    ? daysUntil(member.membershipExpiresAt)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader member={member} />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-24 space-y-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-secondary transition-all">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <section className="bg-[#fdf7f7] border border-rose-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 space-y-4">
            <div className="bg-[#6b4e42] rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg mt-1">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold mb-1">Butuh Bantuan?</h2>
                  <p className="text-xs text-rose-100 leading-relaxed">
                    Pelajari cara menggunakan fitur-fitur Virtual Studio untuk
                    hasil latihan yang maksimal.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                Menu Utama
              </h3>
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                  <button
                    onClick={() =>
                      setActiveTab(activeTab === feature.id ? "" : feature.id)
                    }
                    className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${feature.color} ${feature.textColor} p-2.5 rounded-xl shrink-0`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-secondary">
                          {feature.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-300 transition-transform ${
                        activeTab === feature.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {activeTab === feature.id && (
                    <div className="px-4 pb-4 bg-gray-50/70">
                      <div className="h-px bg-gray-100 w-full mb-4" />
                      <ul className="space-y-3">
                        {feature.steps.map((step, index) => (
                          <li
                            key={`${feature.id}-${index}`}
                            className="flex gap-3 items-start">
                            <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
