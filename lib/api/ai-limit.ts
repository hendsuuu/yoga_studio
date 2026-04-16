import { prisma } from "@/lib/db/prisma";
import { startOfDay } from "date-fns";

export async function checkAiLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiDailyLimit: true, aiDailyLimitMax: true, aiLimitResetDate: true },
  });

  if (!user) return { allowed: false, remaining: 0, limit: 0 };

  const today = startOfDay(new Date());
  let remaining = user.aiDailyLimit;

  // Auto-reset jika hari baru
  if (!user.aiLimitResetDate || startOfDay(user.aiLimitResetDate) < today) {
    remaining = user.aiDailyLimitMax;
    await prisma.user.update({
      where: { id: userId },
      data: { aiDailyLimit: user.aiDailyLimitMax, aiLimitResetDate: today },
    });
  }

  return {
    allowed: remaining > 0,
    remaining,
    limit: user.aiDailyLimitMax,
  };
}

export async function consumeAiLimit(
  userId: string,
  feature: string,
  prompt?: string,
) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { aiDailyLimit: { decrement: 1 } },
    }),
    prisma.aiUsageLog.create({
      data: {
        memberId: userId,
        feature,
        prompt: prompt?.slice(0, 500),
      },
    }),
  ]);
}
