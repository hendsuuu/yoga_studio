import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { coachSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coaches = await prisma.coach.findMany({
    orderBy: { createdAt: "desc" },
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

  const coach = await prisma.coach.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      gender: parsed.data.gender || null,
      photo: parsed.data.photo || null,
      certificate: parsed.data.certificate || null,
      specialty: parsed.data.specialty || null,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json(coach, { status: 201 });
}
