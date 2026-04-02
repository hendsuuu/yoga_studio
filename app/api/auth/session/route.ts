import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
      specialAccess: true,
      membershipExpiresAt: true,
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}
