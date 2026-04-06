"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  Megaphone,
  Settings,
  LogOut,
  Dumbbell,
  Music,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useSidebar } from "./sidebar-context";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/coaches", icon: Dumbbell, label: "Coaches" },
  { href: "/admin/schedules", icon: Calendar, label: "Schedules" },
  { href: "/admin/recordings", icon: Video, label: "Recordings" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/admin/music", icon: Music, label: "Music" },
  { href: "/admin/config", icon: Settings, label: "Config" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    toast.success("Logout berhasil");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-white border-r border-gray-100 min-h-screen flex flex-col shrink-0 transition-all duration-300 z-50",
          collapsed ? "w-[72px]" : "w-60",
          "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-full max-lg:shadow-xl",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        )}>
        {/* Header */}
        <div
          className={cn(
            "border-b border-gray-50 flex items-center",
            collapsed ? "p-3 justify-center" : "p-5 justify-between",
          )}>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-serif italic text-secondary">
                Admin Studio
              </h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Dashboard
              </p>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-serif italic text-sm">A</span>
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  active
                    ? "bg-rose-bg text-primary"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600",
                )}>
                <link.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3">
          <button
            onClick={() => setLogoutConfirm(true)}
            className={cn(
              "flex items-center gap-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 w-full transition-all",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
            )}>
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirm Dialog */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-secondary mb-2">
              Konfirmasi Logout
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin keluar dari admin panel?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLogoutConfirm(false)}
                disabled={logoutLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50">
                {logoutLoading ? "Keluar..." : "Ya, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
