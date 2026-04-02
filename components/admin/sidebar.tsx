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
} from "lucide-react";
import { toast } from "sonner";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/schedules", icon: Calendar, label: "Schedules" },
  { href: "/admin/recordings", icon: Video, label: "Recordings" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/admin/config", icon: Settings, label: "Config" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    toast.success("Logout berhasil");
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-100 min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-50">
        <h1 className="text-lg font-serif italic text-secondary">
          Admin Studio
        </h1>
        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
          Dashboard
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-rose-bg text-primary"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600",
              )}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </a>
          );
        })}
      </nav>
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 w-full transition-all">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
