import { z } from "zod";

const parseableDateSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Tanggal membership tidak valid",
);

const scalevOrderPayloadSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order_id: z.string().optional(),
    status: z.string().optional(),
    payment_status: z.string().optional(),
    paid_time: z.string().nullable().optional(),
    settled_time: z.string().nullable().optional(),
    is_probably_spam: z.boolean().optional(),
    customer_email: z.string().email("Email tidak valid").optional(),
    customer: z
      .object({
        email: z.string().email("Email tidak valid").optional(),
      })
      .passthrough()
      .optional(),
    destination_address: z
      .object({
        email: z.string().email("Email tidak valid").optional(),
      })
      .passthrough()
      .optional(),
    payment_status_history: z
      .array(
        z
          .object({
            status: z.string().optional(),
            by: z
              .object({
                email: z.string().email("Email tidak valid").optional(),
              })
              .passthrough()
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export const scalevSubscriptionWebhookSchema = z
  .object({
    email: z.string().email("Email tidak valid").optional(),
    membershipDays: z.coerce.number().int().positive().optional(),
    membershipExpiresAt: parseableDateSchema.optional(),
    event: z.string().optional(),
    unique_id: z.string().optional(),
    timestamp: z.string().optional(),
    ...scalevOrderPayloadSchema.shape,
    data: scalevOrderPayloadSchema.optional(),
  })
  .passthrough();

export type ScalevSubscriptionWebhookInput = z.infer<
  typeof scalevSubscriptionWebhookSchema
>;

const PAID_SCALEV_STATUSES = new Set([
  "paid",
  "success",
  "completed",
  "settled",
]);

function getOrderPayload(payload: ScalevSubscriptionWebhookInput) {
  return payload.data ?? payload;
}

function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").toLowerCase().trim();
}

function getPaymentStatusHistoryEmail(
  payload: ScalevSubscriptionWebhookInput,
) {
  const history = getOrderPayload(payload).payment_status_history ?? [];
  const reversedHistory = [...history].reverse();
  const paidHistory = reversedHistory.find(
    (item) => item.status?.toLowerCase() === "paid" && item.by?.email,
  );
  const latestHistoryWithEmail = reversedHistory.find((item) => item.by?.email);

  return paidHistory?.by?.email ?? latestHistoryWithEmail?.by?.email ?? "";
}

export function getScalevWebhookEmail(payload: ScalevSubscriptionWebhookInput) {
  const orderPayload = getOrderPayload(payload);

  return normalizeEmail(
    payload.email ??
      orderPayload.destination_address?.email ??
      orderPayload.customer_email ??
      orderPayload.customer?.email ??
      getPaymentStatusHistoryEmail(payload),
  );
}

export function isPaidScalevWebhook(payload: ScalevSubscriptionWebhookInput) {
  const orderPayload = getOrderPayload(payload);
  const isScalevOrderPayload = Boolean(
    payload.event ||
      payload.data ||
      orderPayload.payment_status ||
      orderPayload.status ||
      orderPayload.paid_time ||
      orderPayload.settled_time,
  );

  if (!isScalevOrderPayload) {
    return true;
  }

  const paymentStatus = orderPayload.payment_status?.toLowerCase();
  const orderStatus = orderPayload.status?.toLowerCase();

  return (
    Boolean(paymentStatus && PAID_SCALEV_STATUSES.has(paymentStatus)) ||
    Boolean(orderStatus && PAID_SCALEV_STATUSES.has(orderStatus)) ||
    Boolean(orderPayload.paid_time || orderPayload.settled_time)
  );
}

export function getScalevWebhookPaymentStatus(
  payload: ScalevSubscriptionWebhookInput,
) {
  return getOrderPayload(payload).payment_status ?? null;
}

export function getScalevWebhookOrderId(payload: ScalevSubscriptionWebhookInput) {
  const orderPayload = getOrderPayload(payload);

  return orderPayload.order_id ?? orderPayload.id ?? null;
}

export function isSpamScalevWebhook(payload: ScalevSubscriptionWebhookInput) {
  return Boolean(getOrderPayload(payload).is_probably_spam);
}
