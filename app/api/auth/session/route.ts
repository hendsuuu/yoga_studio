import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const member = await prisma.user.findFirst({
    where: { id: session.id, role: "MEMBER" },
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

  // Auto-deactivate if membership has expired
  if (
    member.isActive &&
    member.membershipExpiresAt &&
    new Date(member.membershipExpiresAt) < new Date()
  ) {
    await prisma.user.update({
      where: { id: member.id },
      data: { isActive: false },
    });
    member.isActive = false;
  }

  return NextResponse.json(member);
}
