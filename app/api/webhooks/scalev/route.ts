import crypto from "crypto";

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

type ScalevSignature = {
  header: string;
  value: string;
};

function createHmacSignature(rawBody: string, signingSecret: string) {
  return crypto
    .createHmac("sha256", signingSecret)
    .update(rawBody, "utf8")
    .digest("base64");
}

function safeCompare(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function getScalevSignature(req: Request): ScalevSignature | null {
  const headers = [
    "x-scalev-hmac-sha256",
    "x-scalev-signature",
    "x-webhook-signature",
  ];

  for (const header of headers) {
    const value = req.headers.get(header);

    if (value) {
      return {
        header,
        value: value.trim(),
      };
    }
  }

  return null;
}

function getScalevWebhookSigningSecret() {
  const signingSecret = process.env.SCALEV_WEBHOOK_SIGNING_SECRET?.trim();

  if (!signingSecret) {
    return null;
  }

  return signingSecret.replace(/^["']|["']$/g, "");
}

function isValidScalevWebhook(req: Request, rawBody: string) {
  const signingSecret = getScalevWebhookSigningSecret();

  if (!signingSecret) {
    return {
      valid: false,
      reason: "SCALEV_WEBHOOK_SIGNING_SECRET is not configured",
      status: 500,
    };
  }

  const signature = getScalevSignature(req);

  if (!signature) {
    return {
      valid: false,
      reason: "Missing HMAC signature header",
      status: 401,
    };
  }

  const expectedSignature = createHmacSignature(rawBody, signingSecret);

  const valid = safeCompare(expectedSignature, signature.value);

  return {
    valid,
    reason: valid ? "Valid signature" : "Invalid HMAC signature",
    header: signature.header,
    status: valid ? 200 : 401,
  };
}

function getRequestLogMeta(req: Request, signatureHeader?: string | null) {
  return {
    method: req.method,
    hasSignatureHeader: Boolean(signatureHeader),
    signatureHeader: signatureHeader ?? null,
  };
}

function getStringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getOrderPayloadForLog(payload: unknown) {
  const rootPayload = getStringRecord(payload);
  const dataPayload = getStringRecord(rootPayload?.data);

  return dataPayload ?? rootPayload;
}

function getEventForLog(payload: unknown) {
  const rootPayload = getStringRecord(payload);

  return getStringValue(rootPayload?.event);
}

function getPaymentStatusForLog(payload: unknown) {
  const orderPayload = getOrderPayloadForLog(payload);

  return getStringValue(orderPayload?.payment_status);
}

function getOrderStatusForLog(payload: unknown) {
  const orderPayload = getOrderPayloadForLog(payload);

  return getStringValue(orderPayload?.status);
}

function hasScalevOrderStatusPayload(payload: unknown) {
  const orderPayload = getOrderPayloadForLog(payload);

  return Boolean(
    getStringValue(orderPayload?.payment_status) ||
    getStringValue(orderPayload?.status) ||
    getStringValue(orderPayload?.paid_time) ||
    getStringValue(orderPayload?.settled_time),
  );
}

function shouldProcessScalevWebhook(payload: unknown) {
  const event = getEventForLog(payload);

  if (event) {
    return SUPPORTED_SCALEV_EVENTS.has(event);
  }

  return hasScalevOrderStatusPayload(payload);
}

function getCustomerEmailForLog(payload: unknown) {
  const rootPayload = getStringRecord(payload);
  const orderPayload = getOrderPayloadForLog(payload);
  const customer = getStringRecord(orderPayload?.customer);
  const destinationAddress = getStringRecord(orderPayload?.destination_address);

  return (
    getStringValue(rootPayload?.email) ??
    getStringValue(destinationAddress?.email) ??
    getStringValue(orderPayload?.customer_email) ??
    getStringValue(customer?.email)
  );
}

function getWebhookPayloadLogMeta(
  req: Request,
  payload: unknown,
  signatureHeader?: string | null,
) {
  const parsedPayload = scalevSubscriptionWebhookSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      ...getRequestLogMeta(req, signatureHeader),
      event: getEventForLog(payload),
      paymentStatus: getPaymentStatusForLog(payload),
      orderStatus: getOrderStatusForLog(payload),
      customerEmail: getCustomerEmailForLog(payload),
    };
  }

  const customerEmail = getScalevWebhookEmail(parsedPayload.data) || null;

  return {
    ...getRequestLogMeta(req, signatureHeader),
    event: parsedPayload.data.event ?? null,
    paymentStatus: getScalevWebhookPaymentStatus(parsedPayload.data),
    orderStatus: getOrderStatusForLog(parsedPayload.data),
    customerEmail,
  };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Scalev webhook endpoint is active. Use POST with HMAC header to test webhook.",
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const validation = isValidScalevWebhook(req, rawBody);
    const signatureHeader = validation.header ?? null;

    logger.info(CONTEXT, "Webhook request received", {
      ...getRequestLogMeta(req, signatureHeader),
    });

    if (!validation.valid) {
      const isServerMisconfigured = validation.status === 500;

      logger[isServerMisconfigured ? "error" : "warn"](
        CONTEXT,
        isServerMisconfigured
          ? "Scalev webhook signing secret is not configured"
          : "Unauthorized webhook request",
        {
          ...getRequestLogMeta(req, signatureHeader),
          reason: validation.reason,
        },
      );

      if (isServerMisconfigured) {
        return NextResponse.json(
          { error: "Webhook signing secret is not configured" },
          { status: 500 },
        );
      }

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rawBody.trim()) {
      logger.warn(CONTEXT, "Webhook rejected because body is empty", {
        ...getRequestLogMeta(req, signatureHeader),
      });

      return NextResponse.json(
        { error: "Webhook body is empty" },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      logger.warn(CONTEXT, "Webhook rejected because JSON is invalid", {
        ...getRequestLogMeta(req, signatureHeader),
      });

      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = scalevSubscriptionWebhookSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn(CONTEXT, "Webhook rejected because payload is invalid", {
        ...getWebhookPayloadLogMeta(req, body, signatureHeader),
      });

      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    logger.info(CONTEXT, "Webhook payload received", {
      ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
    });

    if (!shouldProcessScalevWebhook(parsed.data)) {
      logger.info(CONTEXT, "Webhook ignored because event is unsupported", {
        ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "unsupported_event",
        message:
          "Only order.updated, order.payment_status_changed, or raw Scalev order status payloads are processed.",
      });
    }

    if (isSpamScalevWebhook(parsed.data)) {
      logger.info(CONTEXT, "Webhook ignored because order is spam", {
        ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "spam_order",
      });
    }

    if (!isPaidScalevWebhook(parsed.data)) {
      logger.info(CONTEXT, "Webhook ignored because payment is not paid", {
        ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "payment_not_paid",
      });
    }

    const email = getScalevWebhookEmail(parsed.data);
    const orderId = normalizeScalevOrderId(
      getScalevWebhookOrderId(parsed.data),
    );

    if (!email) {
      logger.warn(CONTEXT, "Customer email not found in paid webhook payload", {
        ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "customer_email_missing",
        message: "Customer email not found. Webhook acknowledged.",
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
        ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
        customerEmail: email,
      });

      return NextResponse.json({
        success: true,
        pending: true,
        reason: "user_not_found_pending_entitlement_stored",
        message:
          "User not found. Pending entitlement stored and webhook acknowledged so Scalev will not retry.",
        entitlement: {
          id: pendingEntitlement.id,
          email: pendingEntitlement.email,
          orderId: pendingEntitlement.orderId,
          membershipExpiresAt:
            pendingEntitlement.membershipExpiresAt.toISOString(),
        },
      });
    }

    if (member.role !== "MEMBER") {
      logger.warn(CONTEXT, "Webhook email belongs to non-member user", {
        ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
        customerEmail: email,
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
      ...getWebhookPayloadLogMeta(req, parsed.data, signatureHeader),
      customerEmail: email,
    });

    return NextResponse.json({
      success: true,
      message: "Member upgraded to premium.",
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
