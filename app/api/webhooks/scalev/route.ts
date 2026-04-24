import { createHmac, timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import {
  getMembershipExpiresAt,
  getPremiumDays,
  normalizeScalevOrderId,
  PREMIUM_AI_DAILY_LIMIT,
  upsertPendingEntitlement,
} from "@/lib/api/premium-entitlement";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import {
  getScalevWebhookEmail,
  getScalevWebhookOrderId,
  getScalevWebhookPaymentStatus,
  isPaidScalevWebhook,
  isSpamScalevWebhook,
  scalevSubscriptionWebhookSchema,
} from "@/lib/validators/webhook";

const CONTEXT = "webhooks/scalev";

function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function safeCompare(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function createScalevSignature(rawBody: string, signingSecret: string) {
  return createHmac("sha256", signingSecret).update(rawBody).digest("base64");
}

function isValidSecret(req: Request, rawBody: string) {
  const configuredSecret = process.env.SCALEV_WEBHOOK_SECRET;

  if (!configuredSecret) {
    logger.error(CONTEXT, "SCALEV_WEBHOOK_SECRET is not configured");
    return false;
  }

  const scalevSignature = req.headers.get("x-scalev-hmac-sha256");

  if (scalevSignature) {
    return safeCompare(
      createScalevSignature(rawBody, configuredSecret),
      scalevSignature,
    );
  }

  const providedSecret =
    getBearerToken(req.headers.get("authorization")) ||
    req.headers.get("x-scalev-webhook-secret") ||
    req.headers.get("x-webhook-secret") ||
    new URL(req.url).searchParams.get("secret");

  if (!providedSecret) {
    return false;
  }

  return safeCompare(configuredSecret, providedSecret);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    if (!isValidSecret(req, rawBody)) {
      logger.warn(CONTEXT, "Unauthorized webhook request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      logger.warn(CONTEXT, "Invalid JSON payload");
      return NextResponse.json(
        { error: "Payload JSON tidak valid" },
        { status: 400 },
      );
    }

    const parsed = scalevSubscriptionWebhookSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn(CONTEXT, "Invalid payload", {
        errors: parsed.error.errors,
      });
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    if (parsed.data.event && parsed.data.event !== "order.updated") {
      logger.info(CONTEXT, "Webhook ignored because event is unsupported", {
        event: parsed.data.event,
        orderId: getScalevWebhookOrderId(parsed.data),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "unsupported_event",
      });
    }

    if (isSpamScalevWebhook(parsed.data)) {
      logger.info(CONTEXT, "Webhook ignored because order is spam", {
        event: parsed.data.event,
        orderId: getScalevWebhookOrderId(parsed.data),
        email: getScalevWebhookEmail(parsed.data),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "spam_order",
      });
    }

    if (!isPaidScalevWebhook(parsed.data)) {
      logger.info(CONTEXT, "Webhook ignored because payment is not paid", {
        event: parsed.data.event,
        paymentStatus: getScalevWebhookPaymentStatus(parsed.data),
        orderId: getScalevWebhookOrderId(parsed.data),
        email: getScalevWebhookEmail(parsed.data),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "payment_not_paid",
      });
    }

    const email = getScalevWebhookEmail(parsed.data);
    const orderId = normalizeScalevOrderId(getScalevWebhookOrderId(parsed.data));

    if (!email) {
      logger.warn(CONTEXT, "Customer email not found in paid webhook payload", {
        event: parsed.data.event,
        paymentStatus: getScalevWebhookPaymentStatus(parsed.data),
        orderId: getScalevWebhookOrderId(parsed.data),
      });

      return NextResponse.json(
        {
          error:
            "Email customer tidak ditemukan di payload Scalev. Gunakan event order.updated/order.created atau fetch order detail dari Scalev berdasarkan order_id.",
          reason: "customer_email_missing",
        },
        { status: 422 },
      );
    }

    const member = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        membershipExpiresAt: true,
      },
    });

    const membershipExpiresAt = getMembershipExpiresAt(
      member?.membershipExpiresAt ?? null,
      getPremiumDays(parsed.data.membershipDays),
      parsed.data.membershipExpiresAt,
    );

    if (!member) {
      const pendingEntitlement = await upsertPendingEntitlement({
        email,
        orderId,
        membershipExpiresAt,
      });

      logger.info(CONTEXT, "Pending entitlement stored", {
        email,
        orderId,
        pendingEntitlementId: pendingEntitlement.id,
        membershipExpiresAt: pendingEntitlement.membershipExpiresAt.toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          pending: true,
          entitlement: {
            id: pendingEntitlement.id,
            email: pendingEntitlement.email,
            orderId: pendingEntitlement.orderId,
            membershipExpiresAt:
              pendingEntitlement.membershipExpiresAt.toISOString(),
          },
        },
        { status: 202 },
      );
    }

    if (member.role !== "MEMBER") {
      logger.warn(CONTEXT, "Webhook email belongs to non-member user", {
        email,
        role: member.role,
        orderId,
      });

      return NextResponse.json(
        { error: "Email bukan akun member" },
        { status: 409 },
      );
    }

    const updatedMember = await prisma.user.update({
      where: { id: member.id },
      data: {
        tier: "PREMIUM",
        isActive: true,
        aiDailyLimit: PREMIUM_AI_DAILY_LIMIT,
        aiDailyLimitMax: PREMIUM_AI_DAILY_LIMIT,
        membershipExpiresAt,
      },
      select: {
        id: true,
        email: true,
        tier: true,
        isActive: true,
        aiDailyLimit: true,
        aiDailyLimitMax: true,
        membershipExpiresAt: true,
      },
    });

    if (orderId) {
      await prisma.pendingEntitlement.updateMany({
        where: {
          orderId,
          claimedAt: null,
        },
        data: {
          claimedAt: new Date(),
          claimedByUserId: updatedMember.id,
        },
      });
    }

    logger.info(CONTEXT, "Member upgraded to premium", {
      email,
      memberId: updatedMember.id,
      membershipExpiresAt: updatedMember.membershipExpiresAt?.toISOString(),
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (err) {
    logger.error(CONTEXT, "Webhook processing failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
