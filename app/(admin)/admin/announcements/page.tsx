"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Megaphone } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/use-admin-announcements";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import type { Announcement } from "@/types";

const emptyForm = { message: "", isActive: true };

export default function AdminAnnouncementsPage() {
  const { data: announcements, isLoading } = useAdminAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: Announcement) {
    setForm({ message: a.message, isActive: a.isActive });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    try {
      if (editingId) {
        await updateAnnouncement.mutateAsync({ id: editingId, data: form });
        toast.success("Pengumuman diperbarui");
      } else {
        await createAnnouncement.mutateAsync(form);
        toast.success("Pengumuman dibuat");
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteAnnouncement.mutateAsync(deleting);
      toast.success("Pengumuman dihapus");
      setDeleting(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">
            Announcements
          </h1>
          <p className="text-sm text-gray-400">
            Kelola pengumuman untuk member
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      {isLoading ? (
        <Loader message="Memuat data..." />
      ) : (announcements || []).length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-10 h-10" />}
          title="Tidak ada pengumuman"
        />
      ) : (
        <div className="space-y-3">
          {(announcements || []).map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start gap-3">
              <div
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-secondary leading-relaxed">
                  {a.message}
                </p>
                <span
                  className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  {a.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(a)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(a.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormModal
        open={showForm}
        title={editingId ? "Edit Pengumuman" : "Tambah Pengumuman"}
        onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Pesan
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
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
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={
                createAnnouncement.isPending || updateAnnouncement.isPending
              }>
              {editingId ? "Simpan" : "Buat"}
            </Button>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Pengumuman"
        message="Apakah Anda yakin ingin menghapus pengumuman ini?"
        loading={deleteAnnouncement.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
