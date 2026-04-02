"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(label);
      toast.success(`${label} disalin`);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedType(label);
      toast.success(`${label} disalin`);
      setTimeout(() => setCopiedType(null), 2000);
    }
  }, []);

  return { copy, copiedType };
}
