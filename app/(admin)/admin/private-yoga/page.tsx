"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminPrivateYoga,
  useCreatePrivateYoga,
  useDeletePrivateYoga,
  useUpdatePrivateYoga,
} from "@/hooks/use-admin-private-yoga";
import { useAdminCoaches } from "@/hooks/use-admin-coaches";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import { CoachSelect } from "@/components/admin/coach-select";
import { StatusSwitch } from "@/components/admin/status-switch";
import { formatHumanDate } from "@/lib/utils";
import type { Coach, PrivateYoga } from "@/types";

const emptyForm = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  coachId: "",
  coachName: "",
  isActive: true,
};

export default function AdminPrivateYogaPage() {
  const { data: sessions, isLoading } = useAdminPrivateYoga();
  const { data: coaches } = useAdminCoaches();
  const createSession = useCreatePrivateYoga();
  const updateSession = useUpdatePrivateYoga();
  const deleteSession = useDeletePrivateYoga();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(session: PrivateYoga) {
    setForm({
      title: session.title,
      date: session.date.split("T")[0],
      startTime: session.startTime,
      endTime: session.endTime,
      coachId: session.coachId,
      coachName: session.coach.name,
      isActive: session.isActive,
    });
    setEditingId(session.id);
    setShowForm(true);
  }

  function handleCoachSelect(name: string, coach?: Coach) {
    setForm((prev) => ({
      ...prev,
      coachName: name,
      coachId: coach?.id || "",
    }));
  }

  async function handleSubmit() {
    const payload = {
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      coachId: form.coachId,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await updateSession.mutateAsync({ id: editingId, data: payload });
        toast.success("Private yoga diperbarui");
      } else {
        await createSession.mutateAsync(payload);
        toast.success("Private yoga dibuat");
      }
      setShowForm(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteSession.mutateAsync(deleting);
      toast.success("Private yoga dihapus");
      setDeleting(null);
      if (selectedSessionId === deleting) setSelectedSessionId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (sessions || []).filter(
      (session) =>
        session.title.toLowerCase().includes(q) ||
        session.coach.name.toLowerCase().includes(q) ||
        (session.bookings || []).some((booking) =>
          booking.fullName.toLowerCase().includes(q),
        ),
    );
  }, [search, sessions]);

  const selectedSession =
    (sessions || []).find((session) => session.id === selectedSessionId) ||
    null;

  function getWhatsappUrl(phone: string) {
    return `https://wa.me/${phone.replace(/\D/g, "")}`;
  }

  if (selectedSession) {
    return (
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => setSelectedSessionId(null)}
              className="mb-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-secondary">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Private Yoga
            </button>
            <h1 className="text-2xl font-serif italic text-secondary">
              {selectedSession.title}
            </h1>
            <p className="text-sm text-gray-400">
              {formatHumanDate(selectedSession.date)} -{" "}
              {selectedSession.startTime} - {selectedSession.endTime} -{" "}
              {selectedSession.coach.name}
            </p>
          </div>
          <div className="rounded-xl bg-rose-bg px-4 py-3 text-primary">
            <p className="text-xs font-bold uppercase tracking-wider">
              Total Booking
            </p>
            <p className="mt-1 text-2xl font-bold">
              {selectedSession.bookings?.length || 0} orang
            </p>
          </div>
        </div>

        {(selectedSession.bookings || []).length === 0 ? (
          <EmptyState
            icon={<UsersRound className="w-10 h-10" />}
            title="Belum ada booking"
            description="User yang booking kelas ini akan tampil di sini."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {(selectedSession.bookings || []).map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-secondary">
                      {booking.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Booking: {formatHumanDate(booking.createdAt)}
                    </p>
                  </div>
                  <a
                    href={getWhatsappUrl(booking.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>

                <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500 sm:grid-cols-2">
                  <p>No WA: {booking.whatsapp}</p>
                  <p>Email: {booking.email || "-"}</p>
                  <p>Usia: {booking.age || "-"}</p>
                  <p>Gender: {booking.gender || "-"}</p>
                  <p className="sm:col-span-2">
                    Pengalaman: {booking.experience || "-"}
                  </p>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Tujuan Latihan
                    </p>
                    <p className="mt-1 leading-6 text-secondary">
                      {booking.goal}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Catatan Kesehatan
                    </p>
                    <p className="mt-1 leading-6 text-gray-500">
                      {booking.healthNotes || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">
            Private Yoga
          </h1>
          <p className="text-sm text-gray-400">
            Kelola jadwal booking private bersama coach
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari judul, coach, atau nama booking..."
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
          title="Tidak ada private yoga"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Judul
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Jam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Coach
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className="cursor-pointer border-b border-gray-50 hover:bg-rose-soft/60">
                    <td className="px-4 py-3 font-medium text-secondary">
                      {session.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatHumanDate(session.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {session.startTime} - {session.endTime}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {session.coach.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-bg px-2.5 py-1 text-xs font-bold text-primary">
                        <UsersRound className="h-3.5 w-3.5" />
                        {session.bookings?.length || 0} orang
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${session.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {session.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(session);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-secondary">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleting(session.id);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
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
        title={editingId ? "Edit Private Yoga" : "Tambah Private Yoga"}
        onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <Input
            label="Judul Yoga"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Tanggal"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <CoachSelect
            label="Coach"
            value={form.coachName}
            onChange={handleCoachSelect}
            coaches={coaches || []}
          />
          <StatusSwitch
            checked={form.isActive}
            onChange={(checked) => setForm({ ...form, isActive: checked })}
            enabledText="Aktif"
            disabledText="Nonaktif"
            description="Jadwal aktif tampil di halaman booking publik."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createSession.isPending || updateSession.isPending}>
              {editingId ? "Simpan" : "Buat"}
            </Button>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Private Yoga"
        message="Apakah Anda yakin ingin menghapus jadwal private yoga ini?"
        loading={deleteSession.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
