"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Mail,
  ArrowLeft,
  Headset,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemberSession } from "@/hooks/use-member-session";
import { Loader } from "@/components/ui/loader";
import { MemberHeader } from "@/components/member/header";

export default function SupportPage() {
  const router = useRouter();
  const { data: member, isLoading: memberLoading } = useMemberSession();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (memberLoading) return <Loader fullScreen message="Memuat..." />;
  if (!member) return <Loader fullScreen message="Mengarahkan..." />;

  const waNumber = config.wa_admin || "";
  const email = config.email_admin || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader member={member} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 space-y-5">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-secondary transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <Headset className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-serif italic text-secondary">Support</h1>
          <p className="text-sm text-gray-400">
            Hubungi kami jika ada pertanyaan atau kendala
          </p>
        </div>

        {loading ? (
          <Loader message="Memuat informasi..." />
        ) : (
          <div className="space-y-4">
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary">
                    WhatsApp Admin
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    +
                    {waNumber
                      .replace(/^62/, "62 ")
                      .replace(/(\d{4})(?=\d)/g, "$1-")}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all shrink-0" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary">Email</p>
                  <p className="text-xs text-gray-400 mt-0.5">{email}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all shrink-0" />
              </a>
            )}

            {!waNumber && !email && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">Informasi kontak belum tersedia.</p>
                <p className="text-xs mt-1">
                  Admin belum mengatur kontak support.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
