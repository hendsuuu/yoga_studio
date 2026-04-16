import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/auth/session";

// POST /api/push/reminder — toggle reminder for a schedule
export async function POST(req: NextRequest) {
  const session = await getMemberSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduleId } = await req.json();
  if (!scheduleId)
    return NextResponse.json({ error: "Missing scheduleId" }, { status: 400 });

  // Check if reminder already exists
  const existing = await prisma.scheduleReminder.findUnique({
    where: {
      memberId_scheduleId: { memberId: session.id, scheduleId },
    },
  });

  if (existing) {
    // Remove reminder (toggle off)
    await prisma.scheduleReminder.delete({ where: { id: existing.id } });
    return NextResponse.json({ active: false });
  }

  // Create reminder (toggle on)
  await prisma.scheduleReminder.create({
    data: { memberId: session.id, scheduleId },
  });

  return NextResponse.json({ active: true });
}

// GET /api/push/reminder?scheduleId=xxx — check reminder status
export async function GET(req: NextRequest) {
  const session = await getMemberSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scheduleId = req.nextUrl.searchParams.get("scheduleId");

  if (scheduleId) {
    const reminder = await prisma.scheduleReminder.findUnique({
      where: {
        memberId_scheduleId: { memberId: session.id, scheduleId },
      },
    });
    return NextResponse.json({ active: !!reminder });
  }

  // Return all active reminders for this member
  const reminders = await prisma.scheduleReminder.findMany({
    where: { memberId: session.id },
    select: { scheduleId: true },
  });

  return NextResponse.json({
    scheduleIds: reminders.map((r) => r.scheduleId),
  });
}
