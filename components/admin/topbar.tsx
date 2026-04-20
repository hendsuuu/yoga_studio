"use client";

import { Menu, PanelLeftClose, PanelLeft, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "./sidebar-context";
import type { AdminProfile } from "@/types";

export function AdminTopbar() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();

  const { data: profile } = useQuery<AdminProfile>({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const res = await fetch("/api/admin/profile", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
      {/* Sidebar toggle */}
      <div className="flex items-center gap-2">
        {/* Mobile: open sidebar */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
          <Menu className="w-5 h-5" />
        </button>
        {/* Desktop: collapse/expand sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex-1" />

      {/* Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-secondary leading-none">
            {profile?.fullName || "Admin"}
          </p>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
            {profile?.role || "ADMIN"}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
