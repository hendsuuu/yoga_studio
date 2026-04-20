"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User, Clock, Shield, Headset } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import type { MemberSession } from "@/types";
import { formatHumanDate, daysUntil } from "@/lib/utils";

interface HeaderProps {
  member: MemberSession;
}

export function MemberHeader({ member }: HeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowProfile(false);
      }
    }
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.clear();
    toast.success("Logout berhasil");
    router.replace("/login");
    router.refresh();
  }

  const remainingDays = member.membershipExpiresAt
    ? daysUntil(member.membershipExpiresAt)
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/yoga.png"
              alt="Virtual Studio"
              width={32}
              height={32}
              className="rounded-lg shadow-sm"
            />
            <div>
              <h2 className="text-sm sm:text-base font-serif italic text-secondary leading-none mb-0.5">
                Virtual Studio
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-primary/60 uppercase tracking-wider leading-none">
                Yoga & Wellness
              </p>
            </div>
          </div>

          {/* User profile button (top right) */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-secondary leading-none">
                  {member.fullName}
                </p>
                <p className="text-[9px] text-gray-400 font-medium mt-0.5 leading-none">
                  Member
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Profile Popover */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 z-[100]">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-secondary truncate">
                        {member.fullName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 space-y-0.5">
                  {member.membershipExpiresAt && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-gray-50">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-500">Masa Aktif</p>
                        <p className="text-[11px] font-semibold text-secondary">
                          {formatHumanDate(member.membershipExpiresAt)}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                          remainingDays !== null && remainingDays <= 7
                            ? "bg-red-50 text-red-500"
                            : "bg-primary/10 text-primary"
                        }`}>
                        {remainingDays} hari
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-gray-50">
                    <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] text-gray-500">Tier:</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        member.tier === "PREMIUM"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                      {member.tier === "PREMIUM" ? "Premium" : "Free Trial"}
                    </span>
                  </div>

                  {member.phone && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
                      <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-[11px] text-gray-500">
                        {member.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full ${member.isActive ? "bg-emerald-400" : "bg-red-400"}`}
                    />
                    <span className="text-xs text-gray-500">
                      Status:{" "}
                      <span className="font-semibold text-secondary">
                        {member.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-2.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/profile");
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Profil Saya</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/support");
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                    <Headset className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Support</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
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
                onClick={() => setShowLogoutConfirm(false)}
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
