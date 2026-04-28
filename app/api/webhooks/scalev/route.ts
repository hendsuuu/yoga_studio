import { timingSafeEqual } from "crypto";

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
const SUPPORTED_SCALEV_EVENTS = new Set([
  "order.updated",
  "order.payment_status_changed",
]);

function safeCompare(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function getRequestLogMeta(req: Request) {
  const url = new URL(req.url);

  return {
    method: req.method,
    hasQuerySecret: url.searchParams.has("secret"),
  };
}

function getStringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getOrderStatusForLog(payload: unknown) {
  const rootPayload = getStringRecord(payload);
  const dataPayload = getStringRecord(rootPayload?.data);
  const orderPayload = dataPayload ?? rootPayload;
  const status = orderPayload?.status;

  return typeof status === "string" ? status : null;
}

function getWebhookPayloadLogMeta(
  req: Request,
  payload: unknown,
  rawBodyLength: number,
) {
  const parsedPayload = scalevSubscriptionWebhookSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const rootPayload = getStringRecord(payload);

    return {
      ...getRequestLogMeta(req),
      event: typeof rootPayload?.event === "string" ? rootPayload.event : null,
      paymentStatus: null,
      orderStatus: getOrderStatusForLog(payload),
      orderId: null,
      customerEmail: null,
      rawBodyLength,
    };
  }

  const customerEmail = getScalevWebhookEmail(parsedPayload.data) || null;

  return {
    ...getRequestLogMeta(req),
    event: parsedPayload.data.event ?? null,
    paymentStatus: getScalevWebhookPaymentStatus(parsedPayload.data),
    orderStatus: getOrderStatusForLog(parsedPayload.data),
    orderId: getScalevWebhookOrderId(parsedPayload.data),
    customerEmail,
    rawBodyLength,
  };
}

function isValidSecret(req: Request) {
  const configuredSecret = process.env.SCALEV_WEBHOOK_SECRET;

  if (!configuredSecret) {
    logger.error(CONTEXT, "SCALEV_WEBHOOK_SECRET is not configured");
    return false;
  }

  const providedSecret = new URL(req.url).searchParams.get("secret");

  if (!providedSecret) {
    logger.warn(CONTEXT, "Missing webhook secret query parameter", {
      ...getRequestLogMeta(req),
    });
    return false;
  }

  return safeCompare(configuredSecret, providedSecret);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const rawBodyLength = Buffer.byteLength(rawBody, "utf8");

    logger.info(CONTEXT, "Webhook request received", {
      ...getRequestLogMeta(req),
      rawBodyLength,
    });

    if (!isValidSecret(req)) {
      logger.warn(CONTEXT, "Unauthorized webhook request", {
        ...getRequestLogMeta(req),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rawBody.trim()) {
      logger.info(CONTEXT, "Webhook ignored because payload is empty", {
        ...getRequestLogMeta(req),
        rawBodyLength,
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "empty_payload",
      });
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      logger.warn(CONTEXT, "Webhook ignored because payload JSON is invalid", {
        ...getRequestLogMeta(req),
        rawBodyLength,
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "invalid_json",
      });
    }

    const parsed = scalevSubscriptionWebhookSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn(CONTEXT, "Webhook ignored because payload is invalid", {
        ...getWebhookPayloadLogMeta(req, body, rawBodyLength),
        errors: parsed.error.errors,
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "invalid_payload",
      });
    }

    logger.info(CONTEXT, "Webhook payload received", {
      ...getWebhookPayloadLogMeta(req, parsed.data, rawBodyLength),
    });

    if (
      parsed.data.event &&
      !SUPPORTED_SCALEV_EVENTS.has(parsed.data.event)
    ) {
      logger.info(CONTEXT, "Webhook ignored because event is unsupported", {
        ...getWebhookPayloadLogMeta(req, parsed.data, rawBodyLength),
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
        ...getWebhookPayloadLogMeta(req, parsed.data, rawBodyLength),
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
        ...getWebhookPayloadLogMeta(req, parsed.data, rawBodyLength),
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
        ...getWebhookPayloadLogMeta(req, parsed.data, rawBodyLength),
        event: parsed.data.event,
        paymentStatus: getScalevWebhookPaymentStatus(parsed.data),
        orderId: getScalevWebhookOrderId(parsed.data),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "customer_email_missing",
      });
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
        ...getWebhookPayloadLogMeta(req, parsed.data, rawBodyLength),
        email,
        role: member.role,
        orderId,
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "email_is_not_member",
      });
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
