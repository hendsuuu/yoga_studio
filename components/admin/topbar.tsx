"use client";

import { useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeft, User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSidebar } from "./sidebar-context";
import type { AdminProfile } from "@/types";
import { FormModal } from "@/components/admin/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function AdminTopbar() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  useEffect(() => {
    if (!profile || profileOpen) return;
    setForm((prev) => ({
      ...prev,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone || "",
    }));
  }, [profile, profileOpen]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        throw new Error("Konfirmasi password tidak sama");
      }

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Gagal memperbarui profil");
      return body as AdminProfile;
    },
    onSuccess: () => {
      toast.success("Profil admin diperbarui");
      setProfileOpen(false);
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    },
  });

  function openProfile() {
    setForm({
      fullName: profile?.fullName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileOpen(true);
  }

  return (
    <>
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
      <button
        type="button"
        onClick={openProfile}
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all hover:bg-gray-50">
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
      </button>
      </header>

      <FormModal
        open={profileOpen}
        title="Edit Profil Admin"
        onClose={() => setProfileOpen(false)}>
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="No HP"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Ganti Password
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Kosongkan bagian ini jika password tidak ingin diubah.
            </p>
            <div className="mt-4 space-y-3">
              <PasswordInput
                label="Password Lama"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
              />
              <PasswordInput
                label="Password Baru"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
              />
              <PasswordInput
                label="Konfirmasi Password Baru"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>

          <p className="rounded-xl bg-rose-soft px-4 py-3 text-xs leading-5 text-gray-500">
            Akun admin yang sedang digunakan hanya bisa diedit, tidak bisa
            dihapus dari panel ini.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => updateProfile.mutate()}
              loading={updateProfile.isPending}>
              Simpan
            </Button>
          </div>
        </div>
      </FormModal>
    </>
  );
}
