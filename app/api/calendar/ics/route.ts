import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/auth/session";
import { generateICS, parseScheduleTimes } from "@/lib/calendar";

// GET /api/calendar/ics?scheduleId=xxx — generate ICS file for a schedule
export async function GET(req: NextRequest) {
  const session = await getMemberSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scheduleId = req.nextUrl.searchParams.get("scheduleId");
  if (!scheduleId)
    return NextResponse.json({ error: "Missing scheduleId" }, { status: 400 });

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule)
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  const { start, end } = parseScheduleTimes(
    schedule.date,
    schedule.timeRange,
    7,
  );

  const ics = generateICS({
    title: schedule.title,
    start,
    end,
    coach: schedule.coach,
    description: `Kelas yoga bersama ${schedule.coach}\\nVirtual Studio - Premium Yoga Experience`,
    uid: `schedule-${schedule.id}@virtualstudio`,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${schedule.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics"`,
    },
  });
}
