import Image from "next/image";
import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";

import { PrivateYogaBookingClient } from "@/components/booking/private-yoga-booking-client";
import { prisma } from "@/lib/db/prisma";
import { formatHumanDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessions = await prisma.privateYoga.findMany({
    where: {
      isActive: true,
      date: { gte: today },
      coach: { isActive: true },
    },
    include: { coach: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const bookingSessions = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    date: session.date.toISOString(),
    dateLabel: formatHumanDate(session.date),
    startTime: session.startTime,
    endTime: session.endTime,
    coach: {
      name: session.coach.name,
      photo: session.coach.photo,
      certificate: session.coach.certificate,
      specialty: session.coach.specialty,
    },
  }));

  return (
    <main className="min-h-screen bg-surface text-secondary">
      <section className="relative overflow-hidden bg-surface-light">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
          <div className="space-y-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <LogIn className="h-3.5 w-3.5" />
              Login Member
            </Link>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-4 w-4" />
                Private Yoga Booking
              </p>
              <h1 className="max-w-2xl font-serif text-4xl italic leading-tight text-secondary sm:text-5xl">
                Jadwal private yoga bersama coach pilihan studio.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Pilih slot yang tersedia, isi biodata diri, lalu admin akan
                melihat booking kamu di dashboard.
              </p>
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-[28px] border border-white bg-rose-soft shadow-xl sm:min-h-[340px]">
            <Image
              src="/images/yoga.png"
              alt="Private yoga studio"
              fill
              priority
              className="object-contain p-8 sm:p-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 via-transparent to-white/10" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="font-serif text-2xl italic text-secondary">
            Slot Tersedia
          </h2>
          <p className="text-sm text-gray-400">
            Semua jadwal di bawah bisa diakses tanpa akun member.
          </p>
        </div>

        <PrivateYogaBookingClient sessions={bookingSessions} />
      </section>
    </main>
  );
}
