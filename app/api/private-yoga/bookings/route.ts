import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { privateYogaBookingSchema } from "@/lib/validators/admin";

export async function POST(req: Request) {
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
        whatsapp: rest.whatsapp.replace(/\D/g, ""),
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
