import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { privateYogaSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.privateYoga.findMany({
    include: {
      coach: true,
      bookings: { orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = privateYogaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const coach = await prisma.coach.findFirst({
    where: { id: parsed.data.coachId, isActive: true },
    select: { id: true },
  });
  if (!coach) {
    return NextResponse.json(
      { error: "Coach tidak ditemukan atau tidak aktif" },
      { status: 400 },
    );
  }

  const { date, ...rest } = parsed.data;
  const created = await prisma.privateYoga.create({
    data: { ...rest, date: new Date(date) },
    include: {
      coach: true,
      bookings: true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
