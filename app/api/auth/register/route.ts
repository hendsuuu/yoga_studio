import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validators/auth";
import { PREMIUM_AI_DAILY_LIMIT } from "@/lib/api/premium-entitlement";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { fullName, email, phone, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const claimedPendingEntitlement = await prisma.$transaction(async (tx) => {
      const pendingEntitlements = await tx.pendingEntitlement.findMany({
        where: {
          email: normalizedEmail,
          source: "scalev",
          claimedAt: null,
          membershipExpiresAt: { gt: new Date() },
        },
        orderBy: { membershipExpiresAt: "desc" },
      });

      const membershipExpiresAt =
        pendingEntitlements[0]?.membershipExpiresAt ?? null;
      const hasPremiumEntitlement = Boolean(membershipExpiresAt);

      const member = await tx.user.create({
        data: {
          fullName: fullName.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          passwordHash,
          role: "MEMBER",
          tier: hasPremiumEntitlement ? "PREMIUM" : "FREE",
          isActive: true,
          aiDailyLimit: hasPremiumEntitlement ? PREMIUM_AI_DAILY_LIMIT : 6,
          aiDailyLimitMax: hasPremiumEntitlement ? PREMIUM_AI_DAILY_LIMIT : 6,
          membershipExpiresAt,
        },
      });

      if (pendingEntitlements.length > 0) {
        await tx.pendingEntitlement.updateMany({
          where: {
            id: { in: pendingEntitlements.map((item) => item.id) },
          },
          data: {
            claimedAt: new Date(),
            claimedByUserId: member.id,
          },
        });
      }

      return pendingEntitlements.length > 0;
    });

    return NextResponse.json(
      { success: true, premiumActivated: claimedPendingEntitlement },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
