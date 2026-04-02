import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { coachSchema } from "@/lib/validators/admin";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coaches = await prisma.user.findMany({
    where: { role: "COACH" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      photo: true,
      certificate: true,
      specialty: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(coaches);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = coachSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword("coach12345");

  const coach = await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase().trim(),
      phone: parsed.data.phone || "",
      passwordHash,
      role: "COACH",
      isActive: parsed.data.isActive,
      photo: parsed.data.photo || null,
      certificate: parsed.data.certificate || null,
      specialty: parsed.data.specialty || null,
    },
  });

  return NextResponse.json(coach, { status: 201 });
}
