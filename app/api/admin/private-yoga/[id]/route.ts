import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { privateYogaUpdateSchema } from "@/lib/validators/admin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = privateYogaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  if (parsed.data.coachId) {
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
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.date && typeof data.date === "string") {
    data.date = new Date(data.date);
  }

  const updated = await prisma.privateYoga.update({
    where: { id },
    data,
    include: {
      coach: true,
      bookings: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.privateYoga.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
