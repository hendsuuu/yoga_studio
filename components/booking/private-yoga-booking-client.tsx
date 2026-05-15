"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAvatarUrl } from "@/lib/avatar";

type PublicPrivateYoga = {
  id: string;
  title: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  coach: {
    name: string;
    photo: string | null;
    certificate: string | null;
    specialty: string | null;
  };
};

type BookingForm = {
  fullName: string;
  whatsapp: string;
  email: string;
  age: string;
  gender: string;
  experience: string;
  goal: string;
  healthNotes: string;
};

const emptyForm: BookingForm = {
  fullName: "",
  whatsapp: "",
  email: "",
  age: "",
  gender: "",
  experience: "",
  goal: "",
  healthNotes: "",
};

export function PrivateYogaBookingClient({
  sessions,
}: {
  sessions: PublicPrivateYoga[];
}) {
  const [selected, setSelected] = useState<PublicPrivateYoga | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  function openBooking(session: PublicPrivateYoga) {
    setSelected(session);
    setForm(emptyForm);
    setSubmittedId(null);
  }

  async function submitBooking() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/private-yoga/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privateYogaId: selected.id,
          ...form,
          age: form.age ? Number(form.age) : "",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Booking gagal");
      setSubmittedId(body.id || "ok");
      toast.success("Booking berhasil dikirim");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-10 text-center shadow-sm">
          <p className="font-medium text-secondary">
            Belum ada jadwal private yoga yang tersedia.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Silakan cek kembali nanti atau hubungi admin studio.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => {
            const time = `${session.startTime} - ${session.endTime}`;
            return (
              <article
                key={session.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-serif text-xl italic text-secondary">
                      {session.title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-gray-400">
                      {session.coach.name}
                    </p>
                  </div>
                  <img
                    src={getAvatarUrl(session.coach.name, session.coach.photo, 96)}
                    alt={session.coach.name}
                    className="h-12 w-12 shrink-0 rounded-xl border border-rose-bg object-cover"
                  />
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {session.dateLabel}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {time}
                  </p>
                  {(session.coach.specialty || session.coach.certificate) && (
                    <p className="rounded-lg bg-rose-soft px-3 py-2 text-xs font-medium text-secondary">
                      {[session.coach.specialty, session.coach.certificate]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </div>
                <Button className="mt-5 w-full" onClick={() => openBooking(session)}>
                  <UserRound className="h-4 w-4" />
                  Isi Biodata Booking
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl animate-in">
            <div className="border-b border-gray-100 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Booking Private Yoga
              </p>
              <h3 className="mt-1 font-serif text-2xl italic text-secondary">
                {selected.title}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {selected.dateLabel}, {selected.startTime} - {selected.endTime}
              </p>
            </div>

            {submittedId ? (
              <div className="px-6 py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h4 className="mt-4 text-lg font-semibold text-secondary">
                  Booking terkirim
                </h4>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Admin akan melihat biodata kamu di dashboard dan menghubungi
                  nomor WhatsApp yang kamu masukkan.
                </p>
                <Button className="mt-6" onClick={() => setSelected(null)}>
                  Tutup
                </Button>
              </div>
            ) : (
              <div className="space-y-4 px-6 py-5">
                <Input
                  label="Nama Lengkap"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="No WhatsApp"
                    placeholder="62812..."
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp: e.target.value })
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    label="Usia"
                    type="number"
                    min={5}
                    max={100}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                  <Input
                    label="Gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  />
                  <Input
                    label="Pengalaman"
                    placeholder="Pemula"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tujuan Latihan
                  </label>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ceritakan tujuan private yoga kamu..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Catatan Kesehatan
                  </label>
                  <textarea
                    value={form.healthNotes}
                    onChange={(e) =>
                      setForm({ ...form, healthNotes: e.target.value })
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Opsional, misal cedera atau kondisi tertentu"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setSelected(null)}
                    disabled={loading}>
                    Batal
                  </Button>
                  <Button onClick={submitBooking} loading={loading}>
                    Kirim Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
