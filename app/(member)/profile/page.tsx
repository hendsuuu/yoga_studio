"use client";

import { User, Calendar, Shield, Mail, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemberSession } from "@/hooks/use-member-session";
import { Loader } from "@/components/ui/loader";
import { MemberHeader } from "@/components/member/header";
import { formatHumanDate, daysUntil } from "@/lib/utils";

export default function ProfilePage() {
  const { data: member, isLoading } = useMemberSession();

  if (isLoading) return <Loader fullScreen message="Memuat profil..." />;
  if (!member) return <Loader fullScreen message="Mengarahkan..." />;

  const isExpired =
    !member.isActive ||
    !member.membershipExpiresAt ||
    new Date(member.membershipExpiresAt) < new Date();

  const remainingDays = member.membershipExpiresAt
    ? daysUntil(member.membershipExpiresAt)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader member={member} />

      <main className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-6">
        {member.isActive && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        )}

        {/* Inactive banner */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-red-600">
              Langganan Anda tidak aktif
            </p>
            <p className="text-xs text-red-500">
              Silakan hubungi admin untuk memperpanjang masa aktif.
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-8 h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-secondary truncate">
                {member.fullName}
              </h1>
              <span
                className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                  member.isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-400" : "bg-red-400"}`}
                />
                {member.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  Email
                </p>
                <p className="text-sm text-secondary">{member.email}</p>
              </div>
            </div>
            {member.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">
                    Telepon
                  </p>
                  <p className="text-sm text-secondary">{member.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Status Langganan
          </h2>

          {member.membershipExpiresAt ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-gray-500">Berlaku Hingga</span>
                </div>
                <span className="text-sm font-semibold text-secondary">
                  {formatHumanDate(member.membershipExpiresAt)}
                </span>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xs text-gray-500">Sisa Waktu</span>
                <span
                  className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                    remainingDays !== null && remainingDays <= 7
                      ? "bg-red-50 text-red-500"
                      : remainingDays !== null && remainingDays <= 14
                        ? "bg-amber-50 text-amber-500"
                        : "bg-primary/10 text-primary"
                  }`}>
                  {remainingDays !== null && remainingDays > 0
                    ? `${remainingDays} hari`
                    : "Sudah habis"}
                </span>
              </div>

              {member.specialAccess && (
                <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-4 py-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    Akses Spesial Aktif
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">
                Belum memiliki langganan aktif
              </p>
            </div>
          )}
        </div>

        {/* Support link for inactive */}
        {isExpired && (
          <Link
            href="/support"
            className="block w-full text-center bg-primary text-white font-semibold text-sm py-3 rounded-xl hover:bg-primary/90 transition-all">
            Hubungi Admin
          </Link>
        )}
      </main>
    </div>
  );
}
