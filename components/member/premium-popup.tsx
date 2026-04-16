"use client";

import { Crown, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PremiumPopup({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95 text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-amber-500" />
        </div>
        <h3 className="text-lg font-serif italic text-secondary mb-2">
          Fitur Premium
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Fitur ini hanya tersedia untuk member{" "}
          <strong className="text-amber-600">Premium</strong>. Hubungi admin
          untuk upgrade akun Anda.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all">
          Mengerti
        </button>
      </div>
    </div>
  );
}
