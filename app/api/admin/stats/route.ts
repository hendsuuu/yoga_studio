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
    totalCoaches,
    totalSchedules,
    totalRecordings,
    activeAnnouncements,
    recentMembersRaw,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.user.count({ where: { role: "MEMBER", isActive: true } }),
    prisma.coach.count(),
    prisma.schedule.count(),
    prisma.recording.count(),
    prisma.announcement.count({ where: { isActive: true } }),
    prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { createdAt: true },
    }),
  ]);

  const dateMap = new Map<string, number>();
  for (const m of recentMembersRaw) {
    const key = m.createdAt.toISOString().split("T")[0];
    dateMap.set(key, (dateMap.get(key) || 0) + 1);
  }
  const recentMembers = Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalMembers,
    activeMembers,
    totalCoaches,
    totalSchedules,
    totalRecordings,
    activeAnnouncements,
    recentMembers,
  });
}
