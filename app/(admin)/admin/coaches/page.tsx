"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  Dumbbell,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminCoaches,
  useCreateCoach,
  useUpdateCoach,
  useDeleteCoach,
} from "@/hooks/use-admin-coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import type { Coach } from "@/types";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  photo: "",
  certificate: "",
  specialty: "",
  isActive: true,
};

export default function AdminCoachesPage() {
  const { data: coaches, isLoading } = useAdminCoaches();
  const createCoach = useCreateCoach();
  const updateCoach = useUpdateCoach();
  const deleteCoach = useDeleteCoach();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(c: Coach) {
    setForm({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      photo: c.photo || "",
      certificate: c.certificate || "",
      specialty: c.specialty || "",
      isActive: c.isActive,
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    try {
      if (editingId) {
        await updateCoach.mutateAsync({ id: editingId, data: form });
        toast.success("Coach diperbarui");
      } else {
        await createCoach.mutateAsync(form);
        toast.success("Coach dibuat (Password default: coach12345)");
      }
      setShowForm(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteCoach.mutateAsync(deleting);
      toast.success("Coach dihapus");
      setDeleting(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  const filtered = (coaches || []).filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">Coaches</h1>
          <p className="text-sm text-gray-400">Kelola data master coach</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4" /> Tambah Coach
        </Button>
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
          icon={<Dumbbell className="w-10 h-10" />}
          title="Tidak ada coach"
          description="Tambah coach baru untuk memulai"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Coach
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden lg:table-cell">
                    Sertifikat
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden lg:table-cell">
                    Spesialisasi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            c.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=C08497&color=fff`
                          }
                          alt={c.fullName}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                        />
                        <span className="font-medium text-secondary">
                          {c.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {c.certificate || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {c.specialty || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-500"
                        }`}>
                        {c.isActive ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {c.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(c.id)}
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

      {/* Form Modal */}
      <FormModal
        open={showForm}
        title={editingId ? "Edit Coach" : "Tambah Coach"}
        onClose={() => setShowForm(false)}>
        <div className="space-y-3">
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
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Foto URL"
            value={form.photo}
            onChange={(e) => setForm({ ...form, photo: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sertifikat"
              placeholder="RYT-200"
              value={form.certificate}
              onChange={(e) =>
                setForm({ ...form, certificate: e.target.value })
              }
            />
            <Input
              label="Spesialisasi"
              placeholder="Vinyasa, Hatha"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Aktif
          </label>
          {!editingId && (
            <p className="text-[10px] text-gray-400">
              Password default untuk coach baru: coach12345
            </p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createCoach.isPending || updateCoach.isPending}>
              {editingId ? "Simpan" : "Buat"}
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Hapus Coach"
        message="Apakah Anda yakin ingin menghapus coach ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleteCoach.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
