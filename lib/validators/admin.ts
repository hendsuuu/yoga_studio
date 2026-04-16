import { z } from "zod";

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

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type RecordingInput = z.infer<typeof recordingSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type AppConfigInput = z.infer<typeof appConfigSchema>;
export type CoachInput = z.infer<typeof coachSchema>;
export type CoachUpdateInput = z.infer<typeof coachUpdateSchema>;
