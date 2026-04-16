"use client";

import { useState } from "react";
import {
  Trash2,
  Edit3,
  Search,
  UserCheck,
  UserX,
  Plus,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  useBulkAiLimit,
} from "@/hooks/use-admin-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import { formatHumanDate, daysUntil, addDaysLocal } from "@/lib/utils";
import type { AdminMember } from "@/types";

const MEMBERSHIP_OPTIONS = [
  { value: "30", label: "30 Hari" },
  { value: "60", label: "60 Hari" },
  { value: "90", label: "90 Hari" },
];

export default function AdminMembersPage() {
  const { data: members, isLoading } = useAdminMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const bulkAiLimit = useBulkAiLimit();

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminMember | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showBulkAi, setShowBulkAi] = useState(false);
  const [bulkAiValue, setBulkAiValue] = useState("10");

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createDays, setCreateDays] = useState("30");
  const [createTier, setCreateTier] = useState<"FREE" | "PREMIUM">("FREE");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editDays, setEditDays] = useState("");
  const [editTier, setEditTier] = useState<"FREE" | "PREMIUM">("FREE");
  const [editAiLimit, setEditAiLimit] = useState("");

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreatePassword("");
    setCreateDays("30");
    setCreateTier("FREE");
  }

  function openCreate() {
    resetCreateForm();
    setCreating(true);
  }

  function openEdit(m: AdminMember) {
    setEditing(m);
    setEditName(m.fullName);
    setEditEmail(m.email);
    setEditPhone(m.phone);
    setEditActive(m.isActive);
    setEditDays("");
    setEditTier(m.tier);
    setEditAiLimit(String(m.aiDailyLimit));
  }

  async function handleCreate() {
    if (!createName || !createEmail || !createPassword) {
      toast.error("Nama, email, dan password wajib diisi");
      return;
    }
    try {
      await createMember.mutateAsync({
        fullName: createName,
        email: createEmail,
        phone: createPhone,
        password: createPassword,
        membershipDays: createDays,
        tier: createTier,
      });
      toast.success("Member berhasil ditambahkan");
      setCreating(false);
      resetCreateForm();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menambahkan member");
    }
  }

  async function handleUpdate() {
    if (!editing) return;
    try {
      const data: Record<string, unknown> = {
        fullName: editName,
        email: editEmail,
        phone: editPhone,
        isActive: editActive,
        tier: editTier,
        aiDailyLimit: Number(editAiLimit) || 6,
      };
      if (editDays) {
        data.membershipExpiresAt = addDaysLocal(new Date(), Number(editDays));
      }
      await updateMember.mutateAsync({
        id: editing.id,
        data,
      });
      toast.success("Member diperbarui");
      setEditing(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui member");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMember.mutateAsync(deleting);
      toast.success("Member dihapus");
      setDeleting(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus member");
    }
  }

  const filtered = (members || []).filter(
    (m) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">Members</h1>
          <p className="text-sm text-gray-400">Kelola data member</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowBulkAi(true)}>
            <Zap className="w-4 h-4 mr-2 text-amber-500" />
            Bulk AI
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah User
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari nama atau email..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Loader message="Memuat data..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="Tidak ada member"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Tier
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    AI/Hari
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Masa Aktif
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Sisa
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-secondary">
                      {m.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.tier === "PREMIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                        {m.tier === "PREMIUM" ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-semibold">
                      {m.aiDailyLimit}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-500"
                        }`}>
                        {m.isActive ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {m.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {m.membershipExpiresAt
                        ? formatHumanDate(m.membershipExpiresAt)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {m.membershipExpiresAt ? (
                        <span
                          className={`font-semibold ${
                            daysUntil(m.membershipExpiresAt) <= 7
                              ? "text-red-500"
                              : daysUntil(m.membershipExpiresAt) <= 14
                                ? "text-amber-500"
                                : "text-emerald-600"
                          }`}>
                          {daysUntil(m.membershipExpiresAt)} hari
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(m.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <FormModal
        open={creating}
        title="Tambah User Baru"
        onClose={() => setCreating(false)}>
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Masukkan nama lengkap"
          />
          <Input
            label="Email"
            type="email"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            placeholder="contoh@email.com"
          />
          <Input
            label="Phone"
            value={createPhone}
            onChange={(e) => setCreatePhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
          <Input
            label="Password"
            type="password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            placeholder="Minimal 6 karakter"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Masa Aktif
            </label>
            <select
              value={createDays}
              onChange={(e) => setCreateDays(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
              {MEMBERSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tier
            </label>
            <select
              value={createTier}
              onChange={(e) =>
                setCreateTier(e.target.value as "FREE" | "PREMIUM")
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="FREE">Free Trial</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setCreating(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} loading={createMember.isPending}>
              Tambah
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        open={!!editing}
        title="Edit Member"
        onClose={() => setEditing(null)}>
        <div className="space-y-4">
          <Input
            label="Nama"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <Input
            label="Phone"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Perpanjang Masa Aktif
            </label>
            <select
              value={editDays}
              onChange={(e) => setEditDays(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">— Tidak diubah —</option>
              {MEMBERSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tier
              </label>
              <select
                value={editTier}
                onChange={(e) =>
                  setEditTier(e.target.value as "FREE" | "PREMIUM")
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="FREE">Free Trial</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Limit/Hari
              </label>
              <input
                type="number"
                min="0"
                value={editAiLimit}
                onChange={(e) => setEditAiLimit(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={editActive ? "true" : "false"}
                onChange={(e) => setEditActive(e.target.value === "true")}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdate} loading={updateMember.isPending}>
              Simpan
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Hapus Member"
        message="Apakah Anda yakin ingin menghapus member ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleteMember.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      {/* Bulk AI Modal */}
      <FormModal
        open={showBulkAi}
        title="Bulk AI Limit"
        onClose={() => setShowBulkAi(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Atur limit AI harian untuk <strong>seluruh user</strong> sekaligus.
            Total member: <strong>{(members || []).length}</strong>
          </p>
          <Input
            label="Jumlah AI Generate / Hari"
            type="number"
            value={bulkAiValue}
            onChange={(e) => setBulkAiValue(e.target.value)}
            placeholder="Masukkan jumlah"
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowBulkAi(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                const val = Number(bulkAiValue);
                if (isNaN(val) || val < 0) {
                  toast.error("Masukkan angka yang valid");
                  return;
                }
                try {
                  await bulkAiLimit.mutateAsync(val);
                  toast.success(`AI limit diperbarui untuk semua user`);
                  setShowBulkAi(false);
                } catch (e: unknown) {
                  toast.error(
                    e instanceof Error ? e.message : "Gagal memperbarui",
                  );
                }
              }}
              loading={bulkAiLimit.isPending}>
              <Zap className="w-4 h-4 mr-2" />
              Terapkan
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
