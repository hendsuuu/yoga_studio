import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { webpush, buildSchedulePayload } from "@/lib/push";

const WIB_OFFSET = 7; // UTC+7

// POST /api/push/send — cron endpoint to send daily reminders
// Sends push notifications for all schedules matching today's date (WIB)
// Protected by a secret token (CRON_SECRET) for security
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Calculate today's date range in WIB (UTC+7)
  const todayWIB = new Date(now.getTime() + WIB_OFFSET * 60 * 60 * 1000);
  const yyyy = todayWIB.getUTCFullYear();
  const mm = todayWIB.getUTCMonth();
  const dd = todayWIB.getUTCDate();

  // Date range: start of today WIB → start of tomorrow WIB (in UTC)
  const dayStart = new Date(
    Date.UTC(yyyy, mm, dd) - WIB_OFFSET * 60 * 60 * 1000,
  );
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  // Find today's active schedules with unsent reminders
  const schedules = await prisma.schedule.findMany({
    where: {
      isActive: true,
      date: { gte: dayStart, lt: dayEnd },
      reminders: { some: { sentAt: null } },
    },
    include: {
      reminders: {
        where: { sentAt: null },
        include: {
          member: { include: { pushSubscriptions: true } },
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const schedule of schedules) {
    const payload = JSON.stringify(buildSchedulePayload(schedule));

    for (const reminder of schedule.reminders) {
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
