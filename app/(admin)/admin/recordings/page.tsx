"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Search, Video } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminRecordings,
  useCreateRecording,
  useUpdateRecording,
  useDeleteRecording,
} from "@/hooks/use-admin-recordings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import { formatHumanDate } from "@/lib/utils";
import type { Recording } from "@/types";

const emptyForm = {
  title: "",
  date: "",
  coach: "",
  duration: "",
  url: "",
  isPublished: true,
};

export default function AdminRecordingsPage() {
  const { data: recordings, isLoading } = useAdminRecordings();
  const createRecording = useCreateRecording();
  const updateRecording = useUpdateRecording();
  const deleteRecording = useDeleteRecording();

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

  function openEdit(r: Recording) {
    setForm({
      title: r.title,
      date: r.date.split("T")[0],
      coach: r.coach,
      duration: r.duration || "",
      url: r.url,
      isPublished: r.isPublished,
    });
    setEditingId(r.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    try {
      if (editingId) {
        await updateRecording.mutateAsync({ id: editingId, data: form });
        toast.success("Recording diperbarui");
      } else {
        await createRecording.mutateAsync(form);
        toast.success("Recording dibuat");
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteRecording.mutateAsync(deleting);
      toast.success("Recording dihapus");
      setDeleting(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const filtered = (recordings || []).filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">
            Recordings
          </h1>
          <p className="text-sm text-gray-400">Kelola rekaman kelas</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari recording..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Loader message="Memuat data..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Video className="w-10 h-10" />}
          title="Tidak ada recording"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Judul
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Tanggal
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Coach
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Durasi
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
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-secondary">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatHumanDate(r.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.coach}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.duration || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {r.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(r.id)}
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

      <FormModal
        open={showForm}
        title={editingId ? "Edit Recording" : "Tambah Recording"}
        onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <Input
            label="Judul"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Durasi"
              placeholder="60 menit"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>
          <Input
            label="Coach"
            value={form.coach}
            onChange={(e) => setForm({ ...form, coach: e.target.value })}
          />
          <Input
            label="URL Video"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="rounded"
            />
            Published
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createRecording.isPending || updateRecording.isPending}>
              {editingId ? "Simpan" : "Buat"}
            </Button>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Recording"
        message="Apakah Anda yakin ingin menghapus recording ini?"
        loading={deleteRecording.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
