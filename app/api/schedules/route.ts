import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getMemberSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedules = await prisma.schedule.findMany({
    where: { isActive: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(schedules);
}
