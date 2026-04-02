"use client";

import { Flower2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MemberSession } from "@/types";

interface HeaderProps {
  member: MemberSession;
}

export function MemberHeader({ member }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logout berhasil");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl px-5 py-4 border-b border-gray-50 flex justify-between items-center">
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
        onClick={handleLogout}
        className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 active:scale-90 transition-all">
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}
