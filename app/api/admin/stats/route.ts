import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalMembers,
    activeMembers,
    totalSchedules,
    totalRecordings,
    activeAnnouncements,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { isActive: true } }),
    prisma.schedule.count(),
    prisma.recording.count(),
    prisma.announcement.count({ where: { isActive: true } }),
  ]);

  return NextResponse.json({
    totalMembers,
    activeMembers,
    totalSchedules,
    totalRecordings,
    activeAnnouncements,
  });
}
