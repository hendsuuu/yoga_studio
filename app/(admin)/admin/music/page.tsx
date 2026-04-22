"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Search, Music, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminMusic,
  useCreateMusic,
  useUpdateMusic,
  useDeleteMusic,
} from "@/hooks/use-admin-music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import type { MusicTrack } from "@/types";

const categories = [
  { value: "relaxation", label: "Relaxation" },
  { value: "meditation", label: "Meditation" },
  { value: "nature", label: "Nature" },
  { value: "ambient", label: "Ambient" },
];

const emptyForm = {
  title: "",
  artist: "",
  duration: "",
  url: "",
  category: "relaxation" as MusicTrack["category"],
};

function getAudioFileLabel(url: string) {
  if (!url) return "";

  try {
    const pathname = new URL(url, "http://local").pathname;
    const rawFilename = decodeURIComponent(
      pathname.split("/").filter(Boolean).at(-1) ?? "",
    );

    if (!rawFilename) return "";

    return rawFilename.replace(/--[0-9a-f]{12,64}(?=\.[^.]+$)/i, "");
  } catch {
    return "";
  }
}

export default function AdminMusicPage() {
  const { data: tracks, isLoading } = useAdminMusic();
  const createMusic = useCreateMusic();
  const updateMusic = useUpdateMusic();
  const deleteMusic = useDeleteMusic();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setUploadedFileName("");
    setShowForm(true);
  }

  function openEdit(t: MusicTrack) {
    setForm({
      title: t.title,
      artist: t.artist,
      duration: t.duration,
      url: t.url,
      category: t.category,
    });
    setEditingId(t.id);
    setUploadedFileName(getAudioFileLabel(t.url));
    setShowForm(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("Hanya file audio yang diizinkan");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 50MB");
      return;
    }

    // Detect duration client-side
    const detectedDuration = await new Promise<string>((resolve) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const secs = Math.floor(audio.duration);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        resolve(`${m}:${s.toString().padStart(2, "0")}`);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => {
        resolve("0:00");
        URL.revokeObjectURL(audio.src);
      };
      audio.src = URL.createObjectURL(file);
    });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/music/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Upload gagal");
      }

      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        url: data.url,
        duration: detectedDuration,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
      setUploadedFileName(file.name);
      toast.success("File berhasil diupload");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengupload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit() {
    if (!form.url) {
      toast.error("Silakan upload file audio terlebih dahulu");
      return;
    }

    try {
      if (editingId) {
        await updateMusic.mutateAsync({ id: editingId, data: form });
        toast.success("Music diperbarui");
      } else {
        await createMusic.mutateAsync(form);
        toast.success("Music ditambahkan");
      }
      setShowForm(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMusic.mutateAsync(deleting);
      toast.success("Music dihapus");
      setDeleting(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }

  const filtered = (tracks || []).filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()),
  );

  const categoryLabel = (cat: string) =>
    categories.find((c) => c.value === cat)?.label || cat;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-secondary">Music</h1>
          <p className="text-sm text-gray-400">
            Kelola audio relaxation untuk member
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Tambah Music
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari judul atau artis..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Loader message="Memuat data..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Music className="w-10 h-10" />}
          title="Belum ada music"
          description="Tambahkan audio relaxation untuk member"
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
                    Artis
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Durasi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Kategori
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-bg flex items-center justify-center text-primary shrink-0">
                          <Music className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-secondary">
                          {t.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.artist}</td>
                    <td className="px-4 py-3 text-gray-500">{t.duration}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
                        {categoryLabel(t.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(t.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
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
        title={editingId ? "Edit Music" : "Tambah Music"}
        onClose={() => setShowForm(false)}
      >
        <div className="space-y-4">
          <Input
            label="Judul"
            placeholder="Nama lagu"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Artis"
            placeholder="Nama artis"
            value={form.artist}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
          />
          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">
              File Audio
            </label>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Music className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-secondary">
                    {uploadedFileName || "Belum ada file yang dipilih"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {uploadedFileName
                      ? "File audio siap dipakai untuk music player member."
                      : "Pilih file audio dari perangkat Anda. Format audio umum didukung, maksimal 50MB."}
                  </p>
                </div>
              </div>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-4 h-4" />
                {uploading
                  ? "Mengupload..."
                  : uploadedFileName
                    ? "Ganti File"
                    : "Pilih File"}
              </label>
            </div>
          </div>
          {form.duration && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-xs text-gray-500">Durasi terdeteksi:</span>
              <span className="text-sm font-semibold text-secondary">
                {form.duration}
              </span>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as MusicTrack["category"],
                })
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors bg-white"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createMusic.isPending || updateMusic.isPending}
            >
              {editingId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Hapus Music"
        message="Apakah Anda yakin ingin menghapus music ini?"
        loading={deleteMusic.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
