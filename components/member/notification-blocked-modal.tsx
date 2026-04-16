"use client";

import { X, Bell, ExternalLink } from "lucide-react";

interface Props {
  onClose: () => void;
}

function detectBrowser(): "chrome" | "firefox" | "safari" | "edge" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("Firefox/")) return "firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";
  if (ua.includes("Chrome/")) return "chrome";
  return "other";
}

const STEPS: Record<
  "chrome" | "firefox" | "safari" | "edge" | "other",
  { label: string; steps: string[] }
> = {
  chrome: {
    label: "Google Chrome",
    steps: [
      'Klik ikon 🔒 atau ⓘ di sebelah kiri URL bar',
      'Pilih "Izin situs" atau "Site settings"',
      'Cari "Notifikasi" dan ubah ke "Izinkan"',
      "Muat ulang halaman ini lalu coba lagi",
    ],
  },
  edge: {
    label: "Microsoft Edge",
    steps: [
      'Klik ikon 🔒 di sebelah kiri URL bar',
      'Klik "Izin untuk situs ini"',
      'Temukan "Notifikasi" dan pilih "Izinkan"',
      "Muat ulang halaman lalu coba lagi",
    ],
  },
  firefox: {
    label: "Mozilla Firefox",
    steps: [
      'Klik ikon 🔒 di sebelah kiri URL bar',
      'Klik panah ▶ di sebelah nama koneksi',
      'Pilih "More Information"',
      'Buka tab "Permissions" → Notifications → pilih "Allow"',
      "Muat ulang halaman lalu coba lagi",
    ],
  },
  safari: {
    label: "Safari",
    steps: [
      'Buka menu Safari → "Preferences" (⌘,)',
      'Pilih tab "Websites" → "Notifications"',
      "Temukan domain situs ini",
      'Ubah ke "Allow"',
      "Muat ulang halaman lalu coba lagi",
    ],
  },
  other: {
    label: "Browser kamu",
    steps: [
      "Buka pengaturan browser (biasanya di URL bar atau menu browser)",
      "Cari izin untuk situs ini",
      'Aktifkan "Notifikasi" → Izinkan',
      "Muat ulang halaman lalu coba lagi",
    ],
  },
};

export function NotificationBlockedModal({ onClose }: Props) {
  const browser = detectBrowser();
  const { label, steps } = STEPS[browser];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-rose-50 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-secondary">
                  Notifikasi Diblokir
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-[12px] text-gray-600 mb-4 leading-relaxed">
            Izin notifikasi sudah diblokir. Ikuti langkah berikut untuk
            mengaktifkannya:
          </p>

          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[12px] text-gray-700 leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors active:scale-[0.98]">
            <ExternalLink className="w-3.5 h-3.5" />
            Muat Ulang Halaman
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors active:scale-[0.98]">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
