import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHumanDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: localeId });
}

export function formatScheduleDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, d MMM", { locale: localeId });
}

export function checkIfLive(date: Date | string, timeRange: string): boolean {
  if (!date || !timeRange) return false;
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (!isToday) return false;

    const times = timeRange.split("-").map((t) => t.trim().replace(".", ":"));
    if (times.length < 2) return false;
    const [startH, startM] = times[0].split(":").map(Number);
    const [endH, endM] = times[1].split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(startH, startM, 0);
    const endTime = new Date();
    endTime.setHours(endH, endM, 0);
    return now >= startTime && now <= endTime;
  } catch {
    return false;
  }
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function addDaysLocal(from: Date, days: number): string {
  const result = addDays(startOfDay(from), days);
  return format(result, "yyyy-MM-dd");
}

export function cleanAIText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/### (.*?)\n/g, "$1\n")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/Pose Mayat/gi, "Savasana")
    .replace(/Anjing Menghadap ke Bawah/gi, "Downward Dog")
    .replace(/Anjing Menghadap Bawah/gi, "Downward Dog")
    .replace(/Pose Kucing-Sapi/gi, "Cat-Cow")
    .replace(/Kucing Sapi/gi, "Cat-Cow")
    .replace(/Pose Kobra/gi, "Cobra Pose")
    .replace(/Pose Segitiga/gi, "Triangle Pose")
    .replace(/Pose Anak/gi, "Child's Pose")
    .replace(/Mayat/gi, "Relaksasi")
    .trim();
}
