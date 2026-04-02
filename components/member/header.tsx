"use client";

import { useState } from "react";
import { Flower2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MemberSession } from "@/types";

interface HeaderProps {
  member: MemberSession;
}

export function MemberHeader({ member }: HeaderProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logout berhasil");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl px-4 sm:px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Flower2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-serif italic text-secondary leading-none mb-0.5">
              Virtual Studio
            </h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tight leading-none">
              {member.fullName}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 active:scale-90 transition-all">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Logout Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-secondary mb-2">
              Konfirmasi Logout
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin keluar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50">
                {loading ? "Keluar..." : "Ya, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
