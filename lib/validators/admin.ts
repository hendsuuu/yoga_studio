import { z } from "zod";

const textField = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`)
    .refine((value) => !/[<>]/.test(value), `${label} tidak boleh berisi HTML`);

const timeField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm");

const optionalCleanText = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .refine((value) => !/[<>]/.test(value), `${label} tidak boleh berisi HTML`)
    .optional()
    .or(z.literal(""));

export const scheduleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  timeRange: z.string().min(1, "Waktu wajib diisi"),
  coach: z.string().min(1, "Coach wajib diisi"),
  coachPhoto: z.string().optional(),
  certificate: z.string().optional(),
  tools: z.string().optional(),
  meetingId: z.string().optional(),
  meetingPass: z.string().optional(),
  zoomUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const recordingSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  coach: z.string().min(1, "Coach wajib diisi"),
  duration: z.string().optional(),
  url: z.string().url("URL tidak valid"),
  isPublished: z.boolean().default(true),
});

export const announcementSchema = z.object({
  message: z.string().min(1, "Pesan wajib diisi"),
  isActive: z.boolean().default(true),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
});

export const appConfigSchema = z.object({
  key: z.string().min(1, "Key wajib diisi"),
  value: z.string().min(1, "Value wajib diisi"),
});

export const memberUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
  tier: z.enum(["FREE", "PREMIUM"]).optional(),
  aiDailyLimit: z.number().int().min(0).optional(),
  membershipExpiresAt: z.string().optional(),
});

export const adminProfileUpdateSchema = z
  .object({
    fullName: textField("Nama lengkap", 120).optional(),
    email: z.string().trim().email("Email tidak valid").optional(),
    phone: z
      .string()
      .trim()
      .max(24, "No HP maksimal 24 karakter")
      .regex(/^[0-9+]*$/, "No HP hanya boleh berisi angka")
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Password lama wajib diisi",
    path: ["currentPassword"],
  });

export const coachSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional(),
  gender: z.string().optional(),
  photo: z.string().optional(),
  certificate: z.string().optional(),
  specialty: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const coachUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  photo: z.string().optional(),
  certificate: z.string().optional(),
  specialty: z.string().optional(),
  isActive: z.boolean().optional(),
});

const privateYogaBaseSchema = z.object({
  title: textField("Judul", 120),
  date: z.string().min(1, "Tanggal wajib diisi"),
  startTime: timeField,
  endTime: timeField,
  coachId: textField("Coach", 80),
  isActive: z.boolean().default(true),
});

export const privateYogaSchema = privateYogaBaseSchema.refine(
  (data) => data.endTime > data.startTime,
  {
    message: "Jam selesai harus setelah jam mulai",
    path: ["endTime"],
  },
);

export const privateYogaUpdateSchema = privateYogaBaseSchema.partial().refine(
  (data) =>
    !data.startTime || !data.endTime || data.endTime > data.startTime,
  {
    message: "Jam selesai harus setelah jam mulai",
    path: ["endTime"],
  },
);

export const privateYogaBookingSchema = z.object({
  privateYogaId: textField("Jadwal", 80),
  fullName: textField("Nama lengkap", 120),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,16}$/, "Nomor WhatsApp tidak valid"),
  email: z.string().trim().email("Email tidak valid").optional().or(z.literal("")),
  age: z.coerce
    .number()
    .int("Usia harus angka bulat")
    .min(5, "Usia tidak valid")
    .max(100, "Usia tidak valid")
    .optional()
    .or(z.literal("")),
  gender: optionalCleanText("Gender", 40),
  experience: optionalCleanText("Pengalaman yoga", 80),
  goal: textField("Tujuan latihan", 500),
  healthNotes: optionalCleanText("Catatan kesehatan", 500),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type RecordingInput = z.infer<typeof recordingSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type AppConfigInput = z.infer<typeof appConfigSchema>;
export type AdminProfileUpdateInput = z.infer<
  typeof adminProfileUpdateSchema
>;
export type CoachInput = z.infer<typeof coachSchema>;
export type CoachUpdateInput = z.infer<typeof coachUpdateSchema>;
export type PrivateYogaInput = z.infer<typeof privateYogaSchema>;
export type PrivateYogaBookingInput = z.infer<typeof privateYogaBookingSchema>;
