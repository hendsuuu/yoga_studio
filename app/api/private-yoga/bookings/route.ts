import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { privateYogaBookingSchema } from "@/lib/validators/admin";
import {
  consumeToken,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipLimit = consumeToken({
    namespace: "private-yoga-booking-ip",
    key: ip,
    capacity: 8,
    refillTokens: 1,
    refillIntervalMs: 30 * 1000,
  });
  if (!ipLimit.allowed) {
    return rateLimitResponse(
      ipLimit,
      "Terlalu banyak percobaan booking. Coba lagi sebentar lagi.",
    );
  }

  const body = await req.json();
  const parsed = privateYogaBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const { privateYogaId, email, age, gender, experience, healthNotes, ...rest } =
    parsed.data;
  const normalizedWhatsapp = rest.whatsapp.replace(/\D/g, "");

  const identityLimit = consumeToken({
    namespace: "private-yoga-booking-identity",
    key: `${ip}:${privateYogaId}:${normalizedWhatsapp}`,
    capacity: 3,
    refillTokens: 1,
    refillIntervalMs: 5 * 60 * 1000,
  });
  if (!identityLimit.allowed) {
    return rateLimitResponse(
      identityLimit,
      "Booking untuk nomor ini terlalu sering. Tunggu beberapa menit lalu coba lagi.",
    );
  }

  const session = await prisma.privateYoga.findFirst({
    where: {
      id: privateYogaId,
      isActive: true,
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      coach: { isActive: true },
    },
    select: { id: true },
  });
  if (!session) {
    return NextResponse.json(
      { error: "Jadwal private yoga tidak tersedia" },
      { status: 404 },
    );
  }

  try {
    const booking = await prisma.privateYogaBooking.create({
      data: {
        privateYogaId,
        ...rest,
        whatsapp: normalizedWhatsapp,
        email: email || null,
        age: typeof age === "number" ? age : null,
        gender: gender || null,
        experience: experience || null,
        healthNotes: healthNotes || null,
      },
    });

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Nomor WhatsApp ini sudah booking untuk jadwal tersebut" },
        { status: 409 },
      );
    }
    throw error;
  }
}
