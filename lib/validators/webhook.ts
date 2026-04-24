import { z } from "zod";

const parseableDateSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Tanggal membership tidak valid",
);

const scalevOrderPayloadSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order_id: z.string().optional(),
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

function getOrderPayload(payload: ScalevSubscriptionWebhookInput) {
  return payload.data ?? payload;
}

export function getScalevWebhookEmail(payload: ScalevSubscriptionWebhookInput) {
  const orderPayload = getOrderPayload(payload);

  return (
    payload.email ??
    orderPayload.destination_address?.email ??
    orderPayload.customer_email ??
    orderPayload.customer?.email ??
    ""
  )
    .toLowerCase()
    .trim();
}

export function isPaidScalevWebhook(payload: ScalevSubscriptionWebhookInput) {
  const orderPayload = getOrderPayload(payload);
  const isScalevOrderPayload = Boolean(
    payload.event ||
      payload.data ||
      orderPayload.payment_status ||
      orderPayload.paid_time ||
      orderPayload.settled_time,
  );

  if (!isScalevOrderPayload) {
    return true;
  }

  const paymentStatus = orderPayload.payment_status?.toLowerCase();

  return (
    paymentStatus === "paid" ||
    paymentStatus === "settled" ||
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
