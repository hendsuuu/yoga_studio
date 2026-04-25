import { addDays, startOfDay } from "date-fns";

import { prisma } from "@/lib/db/prisma";

export const PREMIUM_AI_DAILY_LIMIT = 10;

const DEFAULT_PREMIUM_DAYS = 30;

export function getPremiumDays(payloadDays?: number) {
  if (payloadDays) {
    return payloadDays;
  }

  const configuredDays = Number(process.env.SCALEV_PREMIUM_DAYS);
  if (Number.isInteger(configuredDays) && configuredDays > 0) {
    return configuredDays;
  }

  return DEFAULT_PREMIUM_DAYS;
}

export function getMembershipExpiresAt(
  currentExpiresAt: Date | null,
  premiumDays: number,
  payloadExpiresAt?: string,
) {
  if (payloadExpiresAt) {
    return new Date(payloadExpiresAt);
  }

  const nextExpiresAt = addDays(startOfDay(new Date()), premiumDays);

  if (currentExpiresAt && currentExpiresAt > nextExpiresAt) {
    return currentExpiresAt;
  }

  return nextExpiresAt;
}

export function normalizeScalevOrderId(orderId: string | number | null) {
  if (orderId === null) {
    return null;
  }

  return String(orderId).trim() || null;
}

type PendingEntitlementInput = {
  email: string;
  orderId: string | null;
  membershipExpiresAt: Date;
};

export async function upsertPendingEntitlement({
  email,
  orderId,
  membershipExpiresAt,
}: PendingEntitlementInput) {
  if (orderId) {
    const existing = await prisma.pendingEntitlement.findUnique({
      where: { orderId },
    });

    if (existing?.claimedAt) {
      return existing;
    }

    const nextExpiresAt =
      existing?.membershipExpiresAt &&
      existing.membershipExpiresAt > membershipExpiresAt
        ? existing.membershipExpiresAt
        : membershipExpiresAt;

    return prisma.pendingEntitlement.upsert({
      where: { orderId },
      update: {
        email,
        membershipExpiresAt: nextExpiresAt,
      },
      create: {
        email,
        orderId,
        membershipExpiresAt: nextExpiresAt,
      },
    });
  }

  const existing = await prisma.pendingEntitlement.findFirst({
    where: {
      email,
      source: "scalev",
      claimedAt: null,
    },
    orderBy: { membershipExpiresAt: "desc" },
  });

  if (existing) {
    return prisma.pendingEntitlement.update({
      where: { id: existing.id },
      data: {
        membershipExpiresAt:
          existing.membershipExpiresAt > membershipExpiresAt
            ? existing.membershipExpiresAt
            : membershipExpiresAt,
      },
    });
  }

  return prisma.pendingEntitlement.create({
    data: {
      email,
      membershipExpiresAt,
    },
  });
}
