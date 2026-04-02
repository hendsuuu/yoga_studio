import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(admin);
}
