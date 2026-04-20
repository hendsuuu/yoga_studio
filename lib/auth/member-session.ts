import { startOfDay } from "date-fns";

import { getMemberSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import type { MemberSession } from "@/types";

export async function getCurrentMemberSession(): Promise<MemberSession | null> {
  const session = await getMemberSession();
  if (!session) {
    return null;
  }

  const member = await prisma.user.findFirst({
    where: { id: session.id, role: "MEMBER" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
      tier: true,
      aiDailyLimit: true,
      aiDailyLimitMax: true,
      aiLimitResetDate: true,
      membershipExpiresAt: true,
    },
  });

  if (!member) {
    return null;
  }

  if (
    member.isActive &&
    member.membershipExpiresAt &&
    new Date(member.membershipExpiresAt) < new Date()
  ) {
    await prisma.user.update({
      where: { id: member.id },
      data: { isActive: false },
    });
    member.isActive = false;
  }

  const today = startOfDay(new Date());
  let aiRemaining = member.aiDailyLimit;

  if (
    !member.aiLimitResetDate ||
    startOfDay(new Date(member.aiLimitResetDate)) < today
  ) {
    aiRemaining = member.aiDailyLimitMax;
    await prisma.user.update({
      where: { id: member.id },
      data: { aiDailyLimit: member.aiDailyLimitMax, aiLimitResetDate: today },
    });
  }

  return {
    id: member.id,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    isActive: member.isActive,
    tier: member.tier,
    aiDailyLimit: aiRemaining,
    aiDailyLimitMax: member.aiDailyLimitMax,
    aiUsedToday: member.aiDailyLimitMax - aiRemaining,
    membershipExpiresAt: member.membershipExpiresAt?.toISOString() ?? null,
  };
}
