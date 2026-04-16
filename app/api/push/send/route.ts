import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { webpush, buildSchedulePayload } from "@/lib/push";
import { parseScheduleTimes } from "@/lib/calendar";

// POST /api/push/send — cron endpoint to send reminders 30 min before class
// Protected by a secret token (CRON_SECRET) for security
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const reminderWindowStart = new Date(now.getTime() + 25 * 60 * 1000); // 25 min from now
  const reminderWindowEnd = new Date(now.getTime() + 35 * 60 * 1000); // 35 min from now

  // Find schedules starting within the reminder window
  const schedules = await prisma.schedule.findMany({
    where: { isActive: true },
  });

  let sent = 0;
  let failed = 0;

  for (const schedule of schedules) {
    const { start } = parseScheduleTimes(schedule.date, schedule.timeRange, 7);

    // Check if class starts within the 25–35 min window
    if (start < reminderWindowStart || start > reminderWindowEnd) continue;

    // Find reminders that haven't been sent yet
    const reminders = await prisma.scheduleReminder.findMany({
      where: { scheduleId: schedule.id, sentAt: null },
      include: {
        member: {
          include: { pushSubscriptions: true },
        },
      },
    });

    const payload = JSON.stringify(buildSchedulePayload(schedule));

    for (const reminder of reminders) {
      for (const sub of reminder.member.pushSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
          sent++;
        } catch (err: unknown) {
          failed++;
          // Remove invalid subscriptions (410 Gone or 404)
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 410 || statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
        }
      }

      // Mark reminder as sent
      await prisma.scheduleReminder.update({
        where: { id: reminder.id },
        data: { sentAt: now },
      });
    }
  }

  return NextResponse.json({ sent, failed, timestamp: now.toISOString() });
}
