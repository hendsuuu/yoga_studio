"use client";

import { MessageCircle } from "lucide-react";

interface Props {
  phone: string;
}

export function WhatsAppButton({ phone }: Props) {
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 z-[200] w-13 h-13 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 border-4 border-white">
      <MessageCircle className="w-6 h-6 fill-current" />
    </a>
  );
}
