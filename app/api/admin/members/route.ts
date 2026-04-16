import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { addDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      tier: true,
      isActive: true,
      aiDailyLimit: true,
      aiDailyLimitMax: true,
      membershipExpiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { fullName, email, phone, password, membershipDays, tier } = body;

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 400 },
    );
  }

  const hashedPassword = await hashPassword(password);
  const membershipExpiresAt = membershipDays
    ? addDays(startOfDay(new Date()), Number(membershipDays))
    : null;

  const member = await prisma.user.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      passwordHash: hashedPassword,
      role: "MEMBER",
      tier: tier === "PREMIUM" ? "PREMIUM" : "FREE",
      isActive: true,
      aiDailyLimit: tier === "PREMIUM" ? 10 : 6,
      aiDailyLimitMax: tier === "PREMIUM" ? 10 : 6,
      membershipExpiresAt,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      tier: true,
      isActive: true,
      aiDailyLimit: true,
      aiDailyLimitMax: true,
      membershipExpiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
