"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Search } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/hooks/use-admin-schedules";
import { useAdminCoaches } from "@/hooks/use-admin-coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import { CoachSelect } from "@/components/admin/coach-select";
import { formatHumanDate } from "@/lib/utils";
import type { Schedule, Coach } from "@/types";

const emptyForm = {
  title: "",
  date: "",
  timeRange: "",
  coach: "",
  coachPhoto: "",
  certificate: "",
  tools: "",
  meetingId: "",
  meetingPass: "",
  zoomUrl: "",
  isActive: true,
};

export default function AdminSchedulesPage() {
  const { data: schedules, isLoading } = useAdminSchedules();
  const { data: coaches } = useAdminCoaches();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

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

  function openEdit(s: Schedule) {
    setForm({
      title: s.title,
      date: s.date.split("T")[0],
      timeRange: s.timeRange,
      coach: s.coach,
      coachPhoto: s.coachPhoto || "",
      certificate: s.certificate || "",
      tools: s.tools || "",
      meetingId: s.meetingId || "",
      meetingPass: s.meetingPass || "",
      zoomUrl: s.zoomUrl || "",
      isActive: s.isActive,
    });
    setEditingId(s.id);
    setShowForm(true);
  }

  function handleCoachSelect(name: string, coach?: Coach) {
    setForm((prev) => ({
      ...prev,
      coach: name,
      coachPhoto: coach?.photo || "",
      certificate: coach?.certificate || "",
    }));
  }

  async function handleSubmit() {
    try {
      if (editingId) {
        await updateSchedule.mutateAsync({ id: editingId, data: form });
        toast.success("Schedule diperbarui");
      } else {
        await createSchedule.mutateAsync(form);
        toast.success("Schedule dibuat");
      }
      setShowForm(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteSchedule.mutateAsync(deleting);
      toast.success("Schedule dihapus");
      setDeleting(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  const filtered = (schedules || []).filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">
            Schedules
          </h1>
          <p className="text-sm text-gray-400">Kelola jadwal kelas live</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari jadwal..."
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
          title="Tidak ada schedule"
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
                    Waktu
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Coach
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
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-secondary">
                      {s.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatHumanDate(s.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.timeRange}</td>
                    <td className="px-4 py-3 text-gray-500">{s.coach}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(s.id)}
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
        title={editingId ? "Edit Schedule" : "Tambah Schedule"}
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
              label="Waktu"
              placeholder="06.00-07.00"
              value={form.timeRange}
              onChange={(e) => setForm({ ...form, timeRange: e.target.value })}
            />
          </div>
          <CoachSelect
            label="Coach"
            value={form.coach}
            onChange={handleCoachSelect}
            coaches={coaches || []}
          />
          <Input
            label="Perlengkapan"
            placeholder="Mat, Blok, Strap"
            value={form.tools}
            onChange={(e) => setForm({ ...form, tools: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Meeting ID"
              value={form.meetingId}
              onChange={(e) => setForm({ ...form, meetingId: e.target.value })}
            />
            <Input
              label="Meeting Pass"
              value={form.meetingPass}
              onChange={(e) =>
                setForm({ ...form, meetingPass: e.target.value })
              }
            />
          </div>
          <Input
            label="Zoom URL"
            value={form.zoomUrl}
            onChange={(e) => setForm({ ...form, zoomUrl: e.target.value })}
          />
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
              loading={createSchedule.isPending || updateSchedule.isPending}>
              {editingId ? "Simpan" : "Buat"}
            </Button>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Schedule"
        message="Apakah Anda yakin ingin menghapus schedule ini?"
        loading={deleteSchedule.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
