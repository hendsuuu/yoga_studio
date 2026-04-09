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
      className="fixed bottom-20 right-4 z-[200] w-10 h-10 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 border-[3px] border-white"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
    </a>
  );
}
