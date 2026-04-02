"use client";

import { useState } from "react";
import { Plus, Trash2, Settings, Save } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminConfig,
  useUpsertConfig,
  useDeleteConfig,
} from "@/hooks/use-admin-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, FormModal } from "@/components/admin/dialogs";
import type { AppConfigItem } from "@/types";

export default function AdminConfigPage() {
  const { data: configs, isLoading } = useAdminConfig();
  const upsertConfig = useUpsertConfig();
  const deleteConfig = useDeleteConfig();

  const [form, setForm] = useState({ key: "", value: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openCreate() {
    setForm({ key: "", value: "" });
    setEditingKey(null);
    setShowForm(true);
  }

  function openEdit(c: AppConfigItem) {
    setForm({ key: c.key, value: c.value });
    setEditingKey(c.key);
    setShowForm(true);
  }

  async function handleSubmit() {
    try {
      await upsertConfig.mutateAsync(form);
      toast.success(editingKey ? "Config diperbarui" : "Config dibuat");
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteConfig.mutateAsync(deleting);
      toast.success("Config dihapus");
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
            App Config
          </h1>
          <p className="text-sm text-gray-400">Pengaturan umum aplikasi</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      {isLoading ? (
        <Loader message="Memuat data..." />
      ) : (configs || []).length === 0 ? (
        <EmptyState
          icon={<Settings className="w-10 h-10" />}
          title="Tidak ada konfigurasi"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Key
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Value
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {(configs || []).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-secondary">
                    {c.key}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {c.value}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-secondary">
                        <Save className="w-3.5 h-3.5" />
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
      )}

      <FormModal
        open={showForm}
        title={editingKey ? "Edit Config" : "Tambah Config"}
        onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <Input
            label="Key"
            placeholder="e.g. STUDIO_NAME"
            value={form.key}
            disabled={!!editingKey}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
          />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Value
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} loading={upsertConfig.isPending}>
              {editingKey ? "Simpan" : "Buat"}
            </Button>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Config"
        message="Apakah Anda yakin ingin menghapus konfigurasi ini?"
        loading={deleteConfig.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
