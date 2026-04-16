import { prisma } from "@/lib/db/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function checkAiLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, aiDailyLimit: true },
  });

  if (!user) return { allowed: false, used: 0, limit: 0 };

  const now = new Date();
  const used = await prisma.aiUsageLog.count({
    where: {
      memberId: userId,
      createdAt: { gte: startOfDay(now), lte: endOfDay(now) },
    },
  });

  return {
    allowed: used < user.aiDailyLimit,
    used,
    limit: user.aiDailyLimit,
  };
}

export async function logAiUsage(
  userId: string,
  feature: string,
  prompt?: string,
) {
  await prisma.aiUsageLog.create({
    data: {
      memberId: userId,
      feature,
      prompt: prompt?.slice(0, 500),
    },
  });
}
