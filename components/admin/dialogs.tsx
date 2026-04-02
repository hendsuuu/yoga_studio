"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-semibold text-secondary">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={loading}>
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FormModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function FormModal({ open, title, children, onClose }: FormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm overflow-y-auto pb-10">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-secondary">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
